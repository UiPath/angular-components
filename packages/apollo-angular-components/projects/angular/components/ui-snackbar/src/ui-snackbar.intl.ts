import { Subject } from 'rxjs';

import {
    Injectable,
    OnDestroy,
} from '@angular/core';

@Injectable()
export class UiSnackbarIntl implements OnDestroy {
    closeAriaLabel = 'Close';
    closeSnackbarShortcut = 'Close the snackbar using the shortcut: Delete + x';
    protected _destroyed$ = new Subject<void>();

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}
