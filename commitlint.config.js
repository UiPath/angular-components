module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': () => {
            const scopeList = [
                'a11y',
                'autofocus',
                'click-outside',
                'clipboard',
                'content-loader',
                'dateformat',
                'deps',
                'drag-and-drop-file',
                'file-picker',
                'grid',
                'ng-let',
                'nl2br',
                'password-indicator',
                'password-toggle',
                'playground',
                'progress-button',
                'scroll-into-view',
                'secondformat',
                'snackbar',
                'spinner-button',
                'suggest',
                'testing',
                'virtual-scroll-range-loader',
                'virtual-scroll-viewport-resize',
                'matformfield-required',
                'keyboard-shortcut',
                'tree-select',
            ];

            return [2, 'always', scopeList];
        }
    },
};
