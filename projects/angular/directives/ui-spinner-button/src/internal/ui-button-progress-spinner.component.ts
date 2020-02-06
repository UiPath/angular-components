import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'ui-button-progress-spinner',
    templateUrl: './ui-button-progress-spinner.component.html',
    styleUrls: ['./ui-button-progress-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiButtonProgressSpinnerComponent implements OnDestroy {
    public isRound$ = new BehaviorSubject(false);
    public loading$ = new BehaviorSubject(false);

    public mode$ = new BehaviorSubject<MatProgressSpinner['mode']>('indeterminate');
    public value$ = new BehaviorSubject<MatProgressSpinner['value']>(0);
    public color$ = new BehaviorSubject<MatProgressSpinner['color']>('primary');

    ngOnDestroy() {
        this.isRound$.complete();
        this.loading$.complete();
        this.mode$.complete();
        this.value$.complete();
        this.color$.complete();
    }
}
