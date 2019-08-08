import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable()
export class UiPasswordToggleIntl {
    public changes = new Subject();

    public tooltipShow = 'Show';
    public tooltipHide = 'Hide';
}
