import {
    animate,
    AnimationTriggerMetadata,
    group,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

/**
 * Open / Close animation definitions for UiSuggest.
 *
 * These animations should mainly be kept in sync with the mat-menu animations.
 *
 * Reference: https://github.com/angular/components/blob/master/src/material/menu/menu-animations.ts
 */
export const UI_SUGGEST_ANIMATIONS: {
    readonly transformMenuList: AnimationTriggerMetadata;
} = {
    transformMenuList: trigger('displayState', [
        state('closed', style({
            opacity: 0,
            transform: 'scale(0.8)',
        })),
        transition('closed => open', group([
            animate('100ms linear', style({
                opacity: 1,
            })),
            animate('120ms cubic-bezier(0, 0, 0.2, 1)', style({
                transform: 'scale(1)',
            })),
        ])),
        transition('* => closed', animate('100ms 25ms linear', style({ opacity: 0 }))),
    ]),
};
