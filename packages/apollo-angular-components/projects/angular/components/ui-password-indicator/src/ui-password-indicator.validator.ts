import { AbstractControl } from '@angular/forms';

export type IPasswordValidationFn = (value: string) => boolean;
export interface IRegexLike {
    test: (value: string) => boolean;
}
export type IPasswordRuleSet = Record<string, IRegexLike | IPasswordValidationFn>;
export type IRuleValidationState = Record<string, boolean>;
export const VALIDATION_RULE_NAME = 'complexity';

const resolveFn = (obj: IRegexLike | IPasswordValidationFn) => {
    const isRegexLike = typeof obj === 'object' && !!obj.test;

    if (isRegexLike) { return (obj as IRegexLike).test.bind(obj); }

    if (typeof obj === 'function') { return obj; }

    throw Error('The validation member must be a Function or a Regex!');
};

export const complexityValidator = (rules: IPasswordRuleSet, required: boolean) =>
    (control: AbstractControl) => {
        const value: string = control.value;

        if (
            !required &&
            (value == null || value === '')
        ) { return null; }

        const ruleKeys = Object.keys(rules);

        const validityMap = ruleKeys
            .reduce(
                (ruleStateMap, ruleKey) => {
                    const validator = rules[ruleKey];
                    if (
                        value == null ||
                        !resolveFn(validator)(value)
                    ) {
                        ruleStateMap[ruleKey] = true;
                    }

                    return ruleStateMap;
                },
                {} as IRuleValidationState,
            );

        return !Object.keys(validityMap).length ?
            null :
            {
                [VALIDATION_RULE_NAME]: validityMap,
            };
    };
