import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable()
export class UiPasswordToggleIntl {
    public changes = new Subject();

    public tooltipShow = 'Show';
    public tooltipHide = 'Hide';
}
