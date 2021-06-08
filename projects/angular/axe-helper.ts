import { RunOptions } from 'axe-core';
import * as jasmineAxe from 'jasmine-axe';

// tslint:disable: naming-convention
export const axe = jasmineAxe.configureAxe({
        globalOptions: {
        standards: {
            ariaRoles: {
                combobox: {
                    type: 'widget',
                    requiredOwned: [],
                    requiredAttrs: ['aria-expanded'],
                    allowedAttrs: [
                        'aria-controls',
                        'aria-autocomplete',
                        'aria-readonly',
                        'aria-required',
                        'aria-activedescendant',
                        'aria-orientation',
                    ],
                },
            },
        },
    },
});

let _specFn: typeof it = () => { };
let _focusedSpecFn: typeof fit = () => { };
let _excludedSpecFn: typeof xit = () => { };

export const setSpecFn = (_it: typeof it, _fit: typeof fit, _xit: typeof xit) => {
    _specFn = _it.bind(null);
    _focusedSpecFn = _fit.bind(null);
    _excludedSpecFn = _xit.bind(null);
};

export const a11y = {
    fit: function (...args: Parameters<typeof fit>) {
        _focusedSpecFn?.call(null, ...args);
    },
    xit: function (...args: Parameters<typeof xit>) {
        _excludedSpecFn?.call(null, ...args);
    },
    it: function (...args: Parameters<typeof it>) {
        _specFn?.call(null, ...args);
    },
    suite: function (cb: (customSpecOptions: RunOptions) => void) {
        cb(customSpecOptions);
    },
};

const customSpecOptions: RunOptions = {
    rules: {
        'color-contrast': { enabled: false },
    },
};
