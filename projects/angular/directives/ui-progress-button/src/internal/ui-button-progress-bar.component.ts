import { BehaviorSubject } from 'rxjs';

import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { MatLegacyProgressBar as MatProgressBar } from '@angular/material/legacy-progress-bar';

@Component({
    selector: 'ui-button-progress-bar',
    templateUrl: './ui-button-progress-bar.component.html',
    styleUrls: ['./ui-button-progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiButtonProgressBarComponent implements OnDestroy {
    loading$ = new BehaviorSubject(false);

    mode$ = new BehaviorSubject<MatProgressBar['mode']>('indeterminate');
    value$ = new BehaviorSubject<MatProgressBar['value']>(0);
    bufferValue$ = new BehaviorSubject<MatProgressBar['bufferValue']>(0);
    color$ = new BehaviorSubject<MatProgressBar['color']>('primary');

    ngOnDestroy() {
        this.loading$.complete();
        this.mode$.complete();
        this.value$.complete();
        this.bufferValue$.complete();
        this.color$.complete();
    }
}
