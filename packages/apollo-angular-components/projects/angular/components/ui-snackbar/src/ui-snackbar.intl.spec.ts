import { TestBed } from '@angular/core/testing';

import { UiSnackbarIntl } from './ui-snackbar.intl';

describe('Service: UiSnackbarIntlService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [UiSnackbarIntl],
    }));

    it('should create', () => {
        const service: UiSnackbarIntl = TestBed.get(UiSnackbarIntl);
        expect(service).toBeTruthy();
        expect(service.closeAriaLabel).toEqual('Close');
    });
 });
