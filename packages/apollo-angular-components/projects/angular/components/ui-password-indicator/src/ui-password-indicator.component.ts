import {
    combineLatest,
    Observable,
    Subject,
} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    share,
    takeUntil,
} from 'rxjs/operators';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import type { AbstractControl } from '@angular/forms';

import {
    PROGRESS_ANIMATION,
    RULE_ITEM_ANIMATION,
    RULE_LIST_ANIMATION,
} from './ui-password-indicator.animations';
import { UiPasswordComplexityIntl } from './ui-password-indicator.intl';
import {
    IPasswordRuleSet,
    IRuleValidationState,
    VALIDATION_RULE_NAME,
} from './ui-password-indicator.validator';

type RulesAndStates = [string[], IRuleValidationState];

@Component({
    selector: 'ui-password-indicator',
    templateUrl: './ui-password-indicator.component.html',
    styleUrls: ['./ui-password-indicator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        RULE_ITEM_ANIMATION,
        RULE_LIST_ANIMATION,
        PROGRESS_ANIMATION,
    ],
})
export class UiPasswordIndicatorComponent implements OnInit, OnDestroy {
    @Input()
    control!: AbstractControl;

    @Input()
    passwordRules!: IPasswordRuleSet;

    @Input()
    hideValidRuleDefinition = false;

    state$!: Observable<IRuleValidationState>;
    rules$!: Observable<string[]>;
    visibleRules$!: Observable<string[]>;
    percentage$!: Observable<number>;
    isErrorState$!: Observable<boolean>;

    private _destroyed$ = new Subject<void>();

    constructor(
        public intl: UiPasswordComplexityIntl,
        private _announcer: LiveAnnouncer,
    ) { }

    ngOnInit() {
        this.state$ = this.control
            .valueChanges
            .pipe(
                map(() => this.control.getError(VALIDATION_RULE_NAME) || {}),
                share(),
                takeUntil(this._destroyed$),
            );

        this.isErrorState$ = this.control
            .statusChanges
            .pipe(
                map(this._mapDirtyState),
                takeUntil(this._destroyed$),
            );

        this.rules$ = this.state$
            .pipe(
                map(() => Object.keys(this.passwordRules || {})),
                share(),
            );

        const rulesAndState$ = combineLatest([
            this.rules$,
            this.state$,
        ]).pipe(
            share(),
        );

        this.visibleRules$ = rulesAndState$
            .pipe(
                map(this._mapVisibleRules),
            );

        this.percentage$ = rulesAndState$
            .pipe(
                map(this._calculatePercentage),
                distinctUntilChanged(),
            );

        this.state$.pipe(
            distinctUntilChanged(
                (left, right) => Object.values(left).join('') === Object.values(right).join(''),
            ),
            takeUntil(this._destroyed$),
        ).subscribe(this._announceChanges);
    }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    trackByKey = (_id: number, key: string) => key;

    private _mapDirtyState = () => this.control.dirty &&
        this.control.hasError(VALIDATION_RULE_NAME);

    private _calculatePercentage = ([rules, state]: RulesAndStates) => {
        if (!state) { return 100; }

        const increment = 100 / rules.length;

        const validationPercentage = rules
            .reduce(
                (percentage, ruleKey) => !state[ruleKey] ? percentage + increment : percentage,
                0,
            );

        return validationPercentage;
    };

    private _mapVisibleRules = ([rules, state]: RulesAndStates) => this.hideValidRuleDefinition ?
        rules.filter(rule => state[rule]) :
        rules;

    private _announceChanges = (state: IRuleValidationState) => {
        const rulesNotMet = Object.keys(this.passwordRules || {})
            .filter(
                rule => state[rule],
            )
            .map(
                rule => this.intl.ruleLabel(rule),
            );

        this._announcer.announce(
            rulesNotMet.length
                ? `${this.intl.notMet} ${rulesNotMet.join(', ')}`
                : this.intl.allMet,
            'polite',
        );
    };
}
