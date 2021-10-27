import { Subject } from 'rxjs';

import {
    Injectable,
    OnDestroy,
} from '@angular/core';

@Injectable()
export class UiMatFormFieldRequiredIntl implements OnDestroy {
    /**
     * Notify if changes have occured that require that the labels be updated.
     *
     */
    // eslint-disable-next-line rxjs/finnish
    changes = new Subject<void>();

    tooltipMessage = 'This field is required.';

    ngOnDestroy() {
        this.changes.complete();
    }
}
