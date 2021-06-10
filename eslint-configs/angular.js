module.exports = {
    plugins: [
        '@angular-eslint',
        '@angular-eslint/template',
        'import',
        'jsdoc',
        'prefer-arrow',
    ],
    extends: [
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
    ],
    rules: {
        '@angular-eslint/component-selector': [
            'error',
            {
                'type': 'element',
                'prefix': 'ui',
                'style': 'kebab-case',
            },
        ],
        '@angular-eslint/directive-selector': [
            'error',
            {
                'type': 'attribute',
                'prefix': 'ui',
                'style': 'camelCase',
            },
        ],
        '@angular-eslint/no-lifecycle-call': 'error',
        '@angular-eslint/no-output-native': 'error',
        '@angular-eslint/prefer-on-push-component-change-detection': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            { 'accessibility': 'no-public' },
        ],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                'selector': 'memberLike',
                'modifiers': [
                    'private',
                    'protected',
                ],
                'leadingUnderscore': 'require',
                'format': [
                    'camelCase',
                ],
            },
            {
                'selector': 'memberLike',
                'modifiers': [
                    'public',
                ],
                'leadingUnderscore': 'forbid',
                'format': [
                    'PascalCase',
                    'camelCase',
                ],
            },
            {
                'selector': 'enumMember',
                'format': [
                    'PascalCase',
                    'camelCase',
                ],
            },
            {
                'selector': 'function',
                'format': [
                    'camelCase',
                ],
            },
        ],
        'arrow-body-style': 'error',
        'import/no-deprecated': 'warn',
        'jsdoc/check-alignment': 'error',
        'jsdoc/newline-after-description': 'error',
        'jsdoc/no-types': 'error',
        'prefer-arrow/prefer-arrow-functions': 'error',
    },
};
