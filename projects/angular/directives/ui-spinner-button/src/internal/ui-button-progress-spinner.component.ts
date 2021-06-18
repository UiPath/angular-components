import { BehaviorSubject } from 'rxjs';

import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'ui-button-progress-spinner',
    templateUrl: './ui-button-progress-spinner.component.html',
    styleUrls: ['./ui-button-progress-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiButtonProgressSpinnerComponent implements OnDestroy {
    isRound$ = new BehaviorSubject(false);
    loading$ = new BehaviorSubject(false);

    mode$ = new BehaviorSubject<MatProgressSpinner['mode']>('indeterminate');
    value$ = new BehaviorSubject<MatProgressSpinner['value']>(0);
    color$ = new BehaviorSubject<MatProgressSpinner['color']>('primary');

    ngOnDestroy() {
        this.isRound$.complete();
        this.loading$.complete();
        this.mode$.complete();
        this.value$.complete();
        this.color$.complete();
    }
}
