import { TestBed } from '@angular/core/testing';

import { UiSnackbarIntlService } from './ui-snackbar-intl.service';

describe('Service: UiSnackbarIntlService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [UiSnackbarIntlService],
    }));

    it('should create', () => {
        const service: UiSnackbarIntlService = TestBed.get(UiSnackbarIntlService);
        expect(service).toBeTruthy();
        expect(service.closeAriaLabel).toEqual('Close');
    });
 });
