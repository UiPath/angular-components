import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'ui-content-spinner',
    templateUrl: './ui-content-spinner.component.html',
    styleUrls: ['./ui-content-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiContentSpinnerComponent implements OnDestroy {
    @HostBinding('style.min-height.px')
    public get minHeight() {
        return this.diameter$.value * 2.5;
    }

    public mode$ = new BehaviorSubject<MatProgressSpinner['mode']>('indeterminate');
    public value$ = new BehaviorSubject<MatProgressSpinner['value']>(0);
    public color$ = new BehaviorSubject<MatProgressSpinner['color']>('primary');
    public diameter$ = new BehaviorSubject<MatProgressSpinner['diameter']>(100);
    public style$ = this.diameter$
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
