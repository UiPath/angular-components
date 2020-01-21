import {
    animate,
    style,
    transition,
    trigger,
} from '@angular/animations';

/**
 * Enter / Leave animation generator.
 * NOTE: keep exported as function in order for it to be hoisted! Else the AOT build will fail.
 * @internal
 * @ignore
 */
export function inAndOut(inView: Record<string, any>, outOfView: Record<string, any>, timing: string) {
    return [
        transition(':enter', [
            style(outOfView),
            animate(
                timing,
                style(inView),
            ),
        ]),
        transition(':leave', [
            style(inView),
            animate(
                timing,
                style(outOfView),
            ),
        ]),
    ];
}

const ANIMATION_TIMING = '300ms cubic-bezier(0.55, 0, 0.55, 0.2)';

const INVALID_RULE_OUT = {
    width: 0,
    opacity: 0,
};
const INVALID_RULE_IN = {
    width: '*',
    opacity: 1,
};

export const RULE_ITEM_ANIMATION = trigger(
    'ruleAnimation',
    inAndOut(INVALID_RULE_IN, INVALID_RULE_OUT, ANIMATION_TIMING),
);

const RULE_LIST_OUT = {
    opacity: 0,
    transform: 'translateY(-25%)',
};

const RULE_LIST_IN = {
    opacity: 1,
    transform: 'translateY(0)',
};

export const RULE_LIST_ANIMATION = trigger(
    'ruleListAnimation',
    inAndOut(RULE_LIST_IN, RULE_LIST_OUT, ANIMATION_TIMING),
);

const PROGRESS_OUT = {
    opacity: 0,
};

const PROGRESS_IN = {
    opacity: 1,
};

export const PROGRESS_ANIMATION = trigger(
    'progressAnimation',
    inAndOut(PROGRESS_IN, PROGRESS_OUT, ANIMATION_TIMING),
);
