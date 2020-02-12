import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';

import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'ui-button-progress-bar',
    templateUrl: './ui-button-progress-bar.component.html',
    styleUrls: ['./ui-button-progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiButtonProgressBarComponent implements OnDestroy {
    public loading$ = new BehaviorSubject(false);

    public mode$ = new BehaviorSubject<MatProgressBar['mode']>('indeterminate');
    public value$ = new BehaviorSubject<MatProgressBar['value']>(0);
    public bufferValue$ = new BehaviorSubject<MatProgressBar['bufferValue']>(0);
    public color$ = new BehaviorSubject<MatProgressBar['color']>('primary');

    ngOnDestroy() {
        this.loading$.complete();
        this.mode$.complete();
        this.value$.complete();
        this.bufferValue$.complete();
        this.color$.complete();
    }
}
