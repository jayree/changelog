import salesforceConfig from 'eslint-config-salesforce-typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['**/*.d.ts'],
  },
  ...salesforceConfig,
  prettierRecommended,
  {
    files: ['test/**/*.ts'],
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
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
  },
];
