import startCase from 'lodash-es/startCase';
import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UiPasswordComplexityIntl {
    public changes = new Subject<void>();
    public notMet = 'Complexity rules not met:';
    public allMet = 'All complexity rules are met';

    public ruleLabel = (ruleKey: string) => startCase(ruleKey);
    public percentageTitle = (percentage: number) => `${percentage}%`;
}
