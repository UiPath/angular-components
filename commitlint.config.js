module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': () => {
            const scopeList = [
                'grid',
                'suggest',
                'dateformat',
                'secondformat',
                'autofocus',
                'click-outside',
                'clipboard',
                'drag-and-drop-file',
                'ng-let',
                'scroll-into-view',
                'virtual-scroll-range-loader',
                'virtual-scroll-viewport-resize',
                'snackbar',
                'pipes',
            ];

            return [2, 'always', scopeList];
        }
    },
};