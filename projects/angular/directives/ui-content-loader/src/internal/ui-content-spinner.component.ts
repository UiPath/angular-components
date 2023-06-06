import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { MatLegacyProgressSpinner as MatProgressSpinner } from '@angular/material/legacy-progress-spinner';

@Component({
    selector: 'ui-content-spinner',
    templateUrl: './ui-content-spinner.component.html',
    styleUrls: ['./ui-content-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiContentSpinnerComponent implements OnDestroy {
    @HostBinding('style.min-height.px')
    get minHeight() {
        return this.diameter$.value * 2.5;
    }

    mode$ = new BehaviorSubject<MatProgressSpinner['mode']>('indeterminate');
    value$ = new BehaviorSubject<MatProgressSpinner['value']>(0);
    color$ = new BehaviorSubject<MatProgressSpinner['color']>('primary');
    diameter$ = new BehaviorSubject<MatProgressSpinner['diameter']>(100);
    style$ = this.diameter$
        .pipe(
            map(diameter => {
                const displace = `calc(50% - ${diameter / 2}px)`;
                return {
                    top: displace,
                    left: displace,
                };
            }),
        );

    ngOnDestroy() {
        this.diameter$.complete();
        this.mode$.complete();
        this.value$.complete();
        this.color$.complete();
    }
}
