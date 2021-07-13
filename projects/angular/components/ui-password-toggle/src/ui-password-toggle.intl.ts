import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable()
export class UiPasswordToggleIntl {
    // eslint-disable-next-line rxjs/finnish
    changes = new Subject<void>();

    tooltipShow = 'Show';
    tooltipHide = 'Hide';
}
