
import {
    AbstractControl,
    FormControl,
} from '@angular/forms';

import * as faker from 'faker';

import { complexityValidator } from './ui-password-indicator.validator';

const UUID_REGEX = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

describe('Validator: complexity', () => {
    let control: AbstractControl;

    beforeEach(() => {
        control = new FormControl('');
    });

    it('should return an AbstractControl validator', () => {
        const controlValidator = complexityValidator({}, false);

        expect(controlValidator).toBeFunction();
    });

    describe('State: valid', () => {
        it('should return null if the control has no value and the field is not required', () => {
            const controlValidator = complexityValidator({
                uuid: UUID_REGEX,
                length: (value) => value.length === 36,
            }, false);

            control.setValue(null);
            let validationResult = controlValidator(control);
            expect(validationResult).toBeNull();

            control.setValue('');
            validationResult = controlValidator(control);

            expect(validationResult).toBeNull();
        });

        it('should return null if the control is valid', () => {
            control.setValue(faker.random.uuid());

            const controlValidator = complexityValidator({
                uuid: UUID_REGEX,
                length: (value) => value.length === 36,
            }, true);

            const validationResult = controlValidator(control);

            expect(validationResult).toBeNull();
        });
    });

    describe('State: Invalid', () => {
        it('should return a map of invalid states if the control has no value and is required', () => {
            control.setValue(null);

            const controlValidator = complexityValidator({
                uuid: UUID_REGEX,
                length: (value) => value.length === 36,
            }, true);

            const validationResult = controlValidator(control);
            expect(validationResult).toEqual({
                complexity: {
                    uuid: true,
                    length: true,
                },
            });
        });

        it('should return a map of invalid states if the control is invalid', () => {
            control.setValue(faker.random.alphaNumeric(16));

            const controlValidator = complexityValidator({
                uuid: UUID_REGEX,
                length: (value) => value.length === 36,
            }, true);

            const validationResult = controlValidator(control);
            expect(validationResult).toEqual({
                complexity: {
                    uuid: true,
                    length: true,
                },
            });
        });
    });
});
