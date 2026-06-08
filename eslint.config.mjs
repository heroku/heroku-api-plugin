import herokuEslintConfig from '@heroku-cli/test-utils/eslint-config'
import vitestEslintConfig from '@heroku-cli/test-utils/eslint-config/vitest'

export default [
  ...herokuEslintConfig,
  ...vitestEslintConfig,
  {
    ignores: [
      './dist',
      'coverage/**/*',
      'workflows-repo/**/*',
    ],
  },
  {
    files: [
      '**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
        ecmaVersion: 6,
        sourceType: 'module',
      },
    },
    rules: {
      '@stylistic/comma-dangle': 'warn',
      '@stylistic/function-paren-newline': 'warn',
      '@stylistic/indent': 'warn',
      '@stylistic/lines-between-class-members': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      camelcase: 'off',
      'import/namespace': 'warn',
      'n/shebang': 'warn',
      'node/no-missing-import': 'off',
      'perfectionist/sort-imports': 'warn',
      'perfectionist/sort-objects': 'warn',
      'prefer-arrow-callback': 'warn',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-useless-undefined': 'warn',
      'unicorn/prefer-node-protocol': 'warn',
      'unicorn/prefer-number-properties': 'warn',
    },
  },
]
