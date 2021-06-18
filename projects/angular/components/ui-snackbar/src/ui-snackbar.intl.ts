import { Subject } from 'rxjs';

import {
    Injectable,
    OnDestroy,
} from '@angular/core';

@Injectable()
export class UiSnackbarIntl implements OnDestroy {
    closeAriaLabel = 'Close';
    protected _destroyed$ = new Subject<void>();

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}
