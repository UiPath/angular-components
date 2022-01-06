import {
    Component,
    TemplateRef,
} from '@angular/core';
import {
    ICON_MAP,
    SnackBarType,
    UiSnackBarService,
} from 'projects/angular/components/ui-snackbar/src/ui-snackbar.component';
import {
    SnackbarContentComponent,
    SnackbarContentPayload,
} from 'projects/playground/src/app/pages/snackbar/snackbar-content.component';

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

    openSnackbar(snackbarType: SnackBarType.Error | SnackBarType.Info | SnackBarType.Success | SnackBarType.Warning) {
        this._snack[snackbarType](`This is ${snackbarType}`);
    }

    openSnackbarWithTemplateRef(
        snackbarType: SnackBarType.Error | SnackBarType.Info | SnackBarType.Success | SnackBarType.Warning,
        template: TemplateRef<unknown>,
    ) {
        this._snack[snackbarType](template);
    }

    openSnackbarWithComponent(snackbarType: SnackBarType.Error | SnackBarType.Info | SnackBarType.Success | SnackBarType.Warning) {
        const payload: SnackbarContentPayload = { buttonLabel: 'Click me' };
        this._snack[snackbarType](
            SnackbarContentComponent,
            { payload },
        );
    }

    openWithCustomCssClass(snackbarType: SnackBarType.Error | SnackBarType.Info | SnackBarType.Success | SnackBarType.Warning) {
        const extraCssClasses = ['ui-my-custom-css-class'];
        this._snack[snackbarType](`This is ${snackbarType} with custom CSS class on panel`, { extraCssClasses });
    }
}
