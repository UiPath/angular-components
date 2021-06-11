import {
    ICON_MAP,
    SnackBarType,
    UiSnackBarService,
} from 'projects/angular/components/ui-snackbar/src/ui-snackbar.component';

import { Component } from '@angular/core';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
    selector: 'ui-app-snackbar',
    templateUrl: './snackbar.page.html',
    styleUrls: ['snackbar.page.scss'],
})
export class SnackbarPageComponent {
    public readonly IconMap = ICON_MAP;
    public readonly iconType = [...ICON_MAP.keys()];

    constructor(
        private _snack: UiSnackBarService,
    ) { }

    openSnackbar(snackbarType: SnackBarType.Error | SnackBarType.Info | SnackBarType.Success | SnackBarType.Warning) {
        this._snack[snackbarType](`This is ${snackbarType}`);
    }
}
