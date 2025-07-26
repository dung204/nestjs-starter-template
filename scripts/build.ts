import { $, Glob, build } from 'bun';

await $`rm -rf dist`;

const optionalRequirePackages = [
  'class-transformer',
  'class-transformer/storage',
  'class-validator',
  '@nestjs/microservices',
  '@nestjs/websockets',
  '@fastify/static',
];

const migrationFileNames = Array.from(
   
  new Glob('./src/base/database/migrations/*.ts').scanSync(),
).map((name) => name.replaceAll(/\\/g, '/'));

const result = await build({
  entrypoints: ['./src/main.ts', './src/base/configs/postgres.config.ts', ...migrationFileNames],
  outdir: './dist',
  target: 'bun',
  minify: {
    syntax: true,
    whitespace: true,
  },
  external: optionalRequirePackages.filter((pkg) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(pkg);
      return false;
    } catch (_) {
      return true;
    }
  }),
  splitting: true,
});

if (!result.success) {
  console.log(result.logs[0]);
  process.exit(1);
}

console.log('Built successfully!');
