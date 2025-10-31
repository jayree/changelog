const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const unwrapEsmPlugin = (plugin) => {
  if (plugin && typeof plugin === 'object' && 'default' in plugin && plugin.default) {
    return plugin.default;
  }

  return plugin;
};

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ['**/*.d.ts', '**/*.cjs'],
  },
  ...compat
    .config({
      extends: ['eslint-config-salesforce-typescript', 'plugin:prettier/recommended'],
      plugins: ['eslint-plugin-header'],
      rules: {
        'header/header': [
          2,
          'block',
          [
            '',
            {
              pattern: ' \\* Copyright \\(c\\) \\d{4}, jayree',
              template: ' * Copyright (c) 2023, jayree',
            },
            ' * All rights reserved.',
            ' * Licensed under the BSD 3-Clause license.',
            ' * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause',
            ' ',
          ],
        ],
      },
    })
    .map((config) =>
      config.plugins
        ? {
            ...config,
            plugins: Object.fromEntries(
              Object.entries(config.plugins).map(([name, plugin]) => [name, unwrapEsmPlugin(plugin)]),
            ),
          }
        : config,
    ),
];
