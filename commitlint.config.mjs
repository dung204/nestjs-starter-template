/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'refactor', 'perf', 'test', 'chore', 'revert', 'build', 'ci'],
    ],
  },
};

// biome-ignore lint/style/noDefaultExport: default export required by commitlint
export default config;
