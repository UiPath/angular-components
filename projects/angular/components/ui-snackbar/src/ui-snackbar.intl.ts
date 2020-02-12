import {
    Injectable,
    OnDestroy,
} from '@angular/core';

import { Subject } from 'rxjs';

@Injectable()
export class UiSnackbarIntl implements OnDestroy {
    public closeAriaLabel = 'Close';
    protected _destroyed$ = new Subject<void>();

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}
