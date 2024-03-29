import { TestBed } from '@angular/core/testing';

import { UiSnackbarIntl } from './ui-snackbar.intl';

describe('Service: UiSnackbarIntlService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [UiSnackbarIntl],
    }));

    it('should create', () => {
        const service: UiSnackbarIntl = TestBed.inject(UiSnackbarIntl);
        expect(service).toBeTruthy();
        expect(service.closeSnackbarShortcut).toEqual('Close the snackbar using the shortcut: Delete + x');
    });
});
