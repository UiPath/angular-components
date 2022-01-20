import {
    ICON_MAP,
    SnackBarType,
    UiSnackBarService,
} from 'projects/angular/components/ui-snackbar/src/ui-snackbar.component';
import {
    SnackbarContentComponent,
    SnackbarContentPayload,
} from 'projects/playground/src/app/pages/snackbar/snackbar-content.component';

import {
    Component,
    TemplateRef,
} from '@angular/core';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
    selector: 'ui-app-snackbar',
    templateUrl: './snackbar.page.html',
    styleUrls: ['snackbar.page.scss'],
})
export class SnackbarPageComponent {
    readonly IconMap = ICON_MAP;
    readonly iconType = [...ICON_MAP.keys()];

    constructor(
        private _snack: UiSnackBarService,
    ) { }

    openSnackbar(snackbarType: SnackBarType) {
        (this._snack as any)[snackbarType](`This is ${snackbarType}`);
    }

    openSnackbarWithTemplateRef(
        snackbarType: SnackBarType,
        template: TemplateRef<unknown>,
    ) {
        (this._snack as any)[snackbarType](template);
    }

    openSnackbarWithComponent(snackbarType: SnackBarType) {
        const payload: SnackbarContentPayload = { buttonLabel: 'Click me' };
        (this._snack as any)[snackbarType](
            SnackbarContentComponent,
            { payload },
        );
    }

    openWithCustomCssClass(snackbarType: SnackBarType) {
        const extraCssClasses = ['ui-my-custom-css-class'];
        (this._snack as any)[snackbarType](`This is ${snackbarType} with custom CSS class on panel`, { extraCssClasses });
    }
}
