import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import {
    combineLatest,
    Observable,
    Subject,
} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs/operators';

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
    public control!: AbstractControl;

    @Input()
    public passwordRules!: IPasswordRuleSet;

    @Input()
    public hideValidRuleDefinition = false;

    public state$!: Observable<IRuleValidationState>;
    public rules$!: Observable<string[]>;
    public visibleRules$!: Observable<string[]>;
    public percentage$!: Observable<number>;
    public isErrorState$!: Observable<boolean>;

    private _destroyed$ = new Subject();

    constructor(
        public intl: UiPasswordComplexityIntl,
    ) { }

    ngOnInit() {
        this.state$ = this.control
            .valueChanges
            .pipe(
                map(() => this.control.getError(VALIDATION_RULE_NAME) || {}),
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
            );

        const rulesAndState$ = combineLatest([
            this.rules$,
            this.state$,
        ]);

        this.visibleRules$ = rulesAndState$
            .pipe(
                map(this._mapVisibleRules),
            );

        this.percentage$ = rulesAndState$
            .pipe(
                map(this._calculatePercentage),
                distinctUntilChanged(),
            );
    }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public trackByKey = (_id: number, key: string) => key;

    private _mapDirtyState = () => this.control.dirty &&
        this.control.hasError(VALIDATION_RULE_NAME)


    private _calculatePercentage = ([rules, state]: RulesAndStates) => {
        if (!state) { return 100; }

        const increment = 100 / rules.length;

        const validationPercentage = rules
            .reduce(
                (percentage, ruleKey) => !state[ruleKey] ? percentage + increment : percentage,
                0,
            );

        return validationPercentage;
    }

    private _mapVisibleRules = ([rules, state]: RulesAndStates) => this.hideValidRuleDefinition ?
        rules.filter(rule => state[rule]) :
        rules

}
