import startCase from 'lodash-es/startCase';
import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UiPasswordComplexityIntl {
    // eslint-disable-next-line rxjs/finnish
    changes = new Subject<void>();
    notMet = 'Complexity rules not met:';
    allMet = 'All complexity rules are met';

    ruleLabel = (ruleKey: string) => startCase(ruleKey);
    percentageTitle = (percentage: number) => `${percentage}%`;
}
