module.exports = {
    plugins: [
        'rxjs',
    ],
    rules: {
        'rxjs/no-compat': 'error',
        'rxjs/no-nested-subscribe': 'error',
        'rxjs/no-subject-unsubscribe': 'error',
        'rxjs/no-unsafe-switchmap': 'error',
        'rxjs/no-unsafe-takeuntil': 'error',
        'rxjs/no-create': 'error',
        'rxjs/finnish': [
            'error',
            {
                'functions': false,
                'methods': false,
                'parameters': false,
                'properties': true,
                'variables': true,
            },
        ],
    },
};
