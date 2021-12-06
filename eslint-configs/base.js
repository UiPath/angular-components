module.exports = {
    env: {
        'browser': true,
        'es6': true,
        'node': true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: { 'project': './tsconfig.json' },
    plugins: [
        '@typescript-eslint',
        'modules-newline',
        'simple-import-sort',
        'import',
        'unused-imports',
    ],
    rules: {
        'brace-style': [
            'error',
            '1tbs',
            { 'allowSingleLine': false },
        ],
        'curly': [
            'error',
            'all',
        ],
        'indent': [
            'error',
            4,
        ],
        'linebreak-style': 'off',
        'quotes': [
            'error',
            'single',
            { 'allowTemplateLiterals': true },
        ],
        'semi': [
            'error',
            'always',
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'eol-last': [
            'error',
            'always',
        ],
        'max-len': [
            'error',
            {
                'code': 140,
                'ignoreTemplateLiterals': true,
                'ignoreRegExpLiterals': true,
            },
        ],
        'no-multiple-empty-lines': [
            'error',
            {
                'max': 1,
                'maxBOF': 0,
            },
        ],
        'no-tabs': 'error',
        'no-console': 1,
        'no-var': 2,
        'no-multi-spaces': 2,
        'no-irregular-whitespace': 2,
        'no-trailing-spaces': 2,
        'no-restricted-globals': [
            'error',
            {
                'name': 'fdescribe',
                'message': 'Avoid commiting fdescribe, use describe instead.',
            },
            {
                'name': 'fit',
                'message': 'Avoid commiting fit, use it instead.',
            },
        ],
        /**
         * Disable ESLint no-shadow and enable its TypeScript version because of this
         * issue: https://github.com/typescript-eslint/typescript-eslint/issues/2483
         */
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-underscore-dangle': [
            'error',
            {
                'allowAfterThis': true,
                'allowAfterSuper': true,
            },
        ],
        'space-before-blocks': [ 'error', 'always' ],
        'space-before-function-paren': [
            'error',
            {
                'anonymous': 'never',
                'asyncArrow': 'always',
                'named': 'never',
            },
        ],
        'spaced-comment': [ 'error', 'always', {
            'line': {
                'markers': [ '/' ],
                'exceptions': [ '-', '+' ],
            },
            'block': {
                'markers': [ '!' ],
                'exceptions': [ '*' ],
                'balanced': true,
            },
        } ],
        'space-infix-ops': [ 'error', { 'int32Hint': false } ],
        'object-property-newline': 'error',
        'key-spacing': [
            'error',
        ],
        'keyword-spacing': [
            'error',
        ],
        'space-in-parens': [
            'error',
            'never',
        ],
        'array-bracket-spacing': [
            'error',
            'always',
        ],
        'object-curly-spacing': [
            'error',
            'always',
        ],
        'object-curly-newline': [ 'error', {
            'ObjectExpression': {
                'multiline': true,
                'minProperties': 2,
            },
            'ObjectPattern': {
                'multiline': true,
                'minProperties': 2,
            },
            'ImportDeclaration': {
                'multiline': true,
                'minProperties': 2,
            },
            'ExportDeclaration': {
                'multiline': true,
                'minProperties': 2,
            },
        } ],
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'no-else-return': [ 'error' ],
        'eqeqeq': [ 'error', 'always', { 'null': 'never' } ],
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unnecessary-qualifier': 'error',
        '@typescript-eslint/no-unnecessary-type-constraint': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/prefer-string-starts-ends-with': 'error',
        '@typescript-eslint/prefer-enum-initializers': 'error',
        '@typescript-eslint/explicit-member-accessibility': [ 'error',
            { overrides: { constructors: 'no-public' } },
        ],
        '@typescript-eslint/member-ordering': [
            'error',
            {
                'default': [
                    'public-static-field',
                    'public-instance-field',
                    'protected-static-field',
                    'protected-instance-field',
                    'private-static-field',
                    'private-instance-field',
                    'public-constructor',
                    'protected-constructor',
                    'private-constructor',
                    'public-static-method',
                    'public-instance-method',
                    'protected-static-method',
                    'protected-instance-method',
                    'private-static-method',
                    'private-instance-method',
                ],
            },
        ],
        '@typescript-eslint/member-delimiter-style': 'error',
        '@typescript-eslint/array-type': [
            'error',
            { default: 'array-simple' },
        ],
        'simple-import-sort/imports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'import/order': 'error',
        'comma-spacing': [
            'error',
            {
                'before': false,
                'after': true,
            },
        ],
        'arrow-spacing': [
            'error',
            {
                'before': true,
                'after': true,
            },
        ],
    },
};
