import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { $ } from 'bun';

const allowedCommands = ['generate', 'run', 'revert'] as const;
type AllowedCommand = (typeof allowedCommands)[number];

const allowedOptions = ['help'];

// biome-ignore lint/suspicious/noControlCharactersInRegex: this is required
const ANSI_RE = /\x1B\[[0-?]*[ -/]*[@-~]/g;
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const WHITE = '\x1b[37m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';

const migrationsConfigPath = path.resolve('dist', 'base', 'configs', 'postgres.config.js');
const migrationsDir = path.resolve('src', 'base', 'database', 'migrations');

const {
  values: { help: needHelp },
  tokens,
} = parseArgs({
  args: Bun.argv,
  options: {
    help: {
      type: 'boolean',
      multiple: false,
      default: false,
      short: 'h',
    },
  },
  tokens: true,
  allowPositionals: true,
  strict: false,
});

// Reject unknown flags
checkUnexpectedOptions(() => printMigrationHelp());

if (!tokens[2] || (needHelp && tokens[2].kind === 'option')) {
  printMigrationHelp();
  process.exit(0);
}

if (tokens[2].kind === 'positional') {
  const command = tokens[2].value as AllowedCommand;
  if (needHelp) {
    printHelp(command);
    process.exit(0);
  }

  switch (command) {
    case 'generate': {
      if (tokens[3]?.kind !== 'positional') {
        printError('Missing migration name\n');
        printHelp(command);
        process.exit(1);
      }

      checkUnexpectedOptions(() => printHelp(command));
      checkUnexpectedPositionalArguments(4, () => printHelp(command));

      const migrationName = tokens[3].value;
      const migrationPath = path.resolve(migrationsDir, migrationName);

      console.log(`✨ Generating migration '${migrationName}'...`);
      const { exitCode, stderr } =
        await $`bun run build && NODE_ENV=development bun run --bun typeorm -d ${migrationsConfigPath} migration:generate -p ${migrationPath}`
          .nothrow()
          .quiet();

      if (exitCode === 0) {
        const latestMigrationFileName = await getLatestFileName(migrationsDir);
        console.log(
          `✅ Migration '${migrationName}' has been generated successfully. Saved at ${path.resolve(migrationsDir, latestMigrationFileName)}`
        );
        break;
      }

      printError('❌ Generating migration failed.');
      console.error(stderr);
      process.exit(1);
      break;
    }

    case 'revert': {
      checkUnexpectedOptions(() => printHelp(command));
      checkUnexpectedPositionalArguments(3, () => printHelp(command));

      const { exitCode } =
        await $`bun run --bun typeorm -d ${migrationsConfigPath} migration:revert`;

      if (exitCode !== 0) {
        printError(`\n❌ Reverting migration failed.`);
        process.exit(exitCode);
      }

      console.log(`\n✅ Reverting migrations successfully.`);
      break;
    }

    case 'run': {
      checkUnexpectedOptions(() => printHelp(command));
      checkUnexpectedPositionalArguments(3, () => printHelp(command));

      if ((await fs.stat('./src')).isDirectory()) {
        console.log('🛠️  Detected src/ folder. Building...');
        const { stderr, stdout, exitCode } = await $`bun run build`.nothrow().quiet();

        if (exitCode === 0) console.log(stdout.toString());
        else printError(stderr.toString());
      }

      const { exitCode } =
        await $`bun run --bun typeorm -d ${migrationsConfigPath} migration:run`.nothrow();

      if (exitCode !== 0) {
        printError(`\n❌ Running migrations failed.`);
        process.exit(exitCode);
      }

      console.log(`\n✅ Running migrations successfully.`);
      break;
    }

    default:
      printError(
        `Unknown command: '${command}'. The available commands are: ${allowedCommands.map((cmd) => `'${cmd}'`).join(', ')}`
      );
      process.exit(1);
  }
  process.exit(0);
}

function printMigrationHelp() {
  console.log(
    `${BOLD}Usage: ${GREEN}bun [run] migration ${MAGENTA}<command> ${CYAN}[...options] ${WHITE}[...args]\n`
  );
  console.log('  A command-line tool allowing you to work with TypeORM migrations\n');
  console.log(`${RESET}${BOLD}Command:`);
  console.log(
    `${RESET}  ${fmtFixed(`${MAGENTA}generate`, 30)}${RESET}Generate a new TypeORM migration file from entity changes.`
  );
  console.log(
    `${RESET}  ${fmtFixed(`${MAGENTA}revert`, 30)}${RESET}Revert the last executed migration (one step down).`
  );
  console.log(
    `${RESET}  ${fmtFixed(`${MAGENTA}run`, 30)}${RESET}Apply all pending migrations to the database (migrate up).\n`
  );
  console.log(`${RESET}${BOLD}Options:`);
  console.log(
    `${RESET}  ${fmtFixed(`${CYAN}-h${WHITE}, ${CYAN}--help`, 30)}${RESET}Display this help menu and exit`
  );
}

function printHelp(command: AllowedCommand) {
  switch (command) {
    case 'generate':
      console.log(
        `${BOLD}Usage: ${GREEN}bun [run] migration ${command} ${RESET}${CYAN}[options] ${WHITE}<migration name>\n`
      );
      console.log(`${RESET}  Generate a new TypeORM migration file from entity changes.\n`);
      console.log(`${RESET}${BOLD}Flags:`);
      console.log(
        `${RESET}  ${fmtFixed(`${CYAN}-h${WHITE}, ${CYAN}--help`, 30)}${RESET}Display this help menu and exit`
      );

      break;

    case 'revert':
      console.log(
        `${BOLD}Usage: ${GREEN}bun [run] migration ${command} ${RESET}${CYAN}[options]\n`
      );
      console.log(`${RESET}  Revert the last executed migration (one step down).\n`);
      console.log(`${RESET}${BOLD}Flags:`);
      console.log(
        `${RESET}  ${fmtFixed(`${CYAN}-h${WHITE}, ${CYAN}--help`, 30)}${RESET}Display this help menu and exit`
      );
      break;
    case 'run':
      console.log(
        `${BOLD}Usage: ${GREEN}bun [run] migration ${command} ${RESET}${CYAN}[options]\n`
      );
      console.log(`  ${RESET}Apply all pending migrations to the database (migrate up).\n`);
      console.log(`${RESET}${BOLD}Flags:`);
      console.log(
        `${RESET}  ${fmtFixed(`${CYAN}-h${WHITE}, ${CYAN}--help`, 30)}${RESET}Display this help menu and exit`
      );
      break;
    default:
      printError(
        `Unknown command '${command}'. The available commands are: ${allowedCommands.map((cmd) => `'${cmd}'`).join(', ')}`
      );
      break;
  }
}

function printError(msg: string) {
  console.error(`${RED}error: ${RESET}${BOLD}${msg}`);
}

async function getLatestFileName(
  dir: string,
  opts?: { ext?: string; contains?: string }
): Promise<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = entries
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => (opts?.ext ? path.extname(name) === opts.ext : true))
    .filter((name) => (opts?.contains ? name.includes(opts.contains) : true));

  if (files.length === 0) return '';

  const stats = await Promise.all(
    files.map(async (name) => {
      const full = path.join(dir, name);
      const st = await fs.stat(full);
      // Prefer creation time; fall back to mtime where birthtime isn’t reliable
      const t = st.birthtimeMs > 0 ? st.birthtimeMs : st.mtimeMs;
      return { name, time: t };
    })
  );

  const latest = stats.reduce((a, b) => (b.time > a.time ? b : a));
  return latest.name;
}

function checkUnexpectedPositionalArguments(fromIndex: number, callbackFn?: () => void) {
  const extraArg = tokens.find((t, i) => i >= fromIndex && t.kind === 'positional') as
    | { kind: 'positional'; value: string }
    | undefined;

  if (extraArg) {
    printError(`Unexpected argument: '${extraArg.value}'\n`);
    callbackFn?.();
    process.exit(1);
  }
}

function checkUnexpectedOptions(callbackFn?: () => void) {
  const extraOption = tokens.find((t) => t.kind === 'option' && !allowedOptions.includes(t.name)) as
    | { kind: 'option'; name: string; rawName: string }
    | undefined;

  if (extraOption) {
    printError(`Unexpected option: '${extraOption.rawName}'\n`);
    callbackFn?.();
    process.exit(1);
  }
}

function stripAnsi(s: string) {
  return s.replace(ANSI_RE, '');
}

function truncateAnsi(s: string, width: number) {
  if (width <= 0) return '';
  let out = '';
  let visible = 0;

  for (let i = 0; i < s.length && visible < width; ) {
    // If an ANSI sequence starts here, copy it verbatim (no width impact)
    if (s[i] === '\x1b') {
      const match = s.slice(i).match(ANSI_RE);
      if (match && match.index === 0) {
        out += match[0];
        i += match[0].length;
        continue;
      }
    }

    // Copy one Unicode code point (handles surrogate pairs)
    const cp = s.codePointAt(i)!;
    out += String.fromCodePoint(cp);
    i += cp > 0xffff ? 2 : 1;
    visible += 1; // counts as 1 cell; for emoji/wide chars see note below
  }

  // Ensure styles don’t bleed if we truncated mid-style
  if (out.length < s.length && !out.endsWith('\x1b[0m')) {
    out += '\x1b[0m';
  }
  return out;
}

function visibleWidth(s: string) {
  return stripAnsi(s).length;
}

function fmtFixed(text: string, width: number, align: 'left' | 'right' = 'left') {
  const input = String(text ?? '');
  const truncated = truncateAnsi(input, width);
  const w = visibleWidth(truncated);
  const pad = Math.max(0, width - w);
  return align === 'right' ? ' '.repeat(pad) + truncated : truncated + ' '.repeat(pad);
}
