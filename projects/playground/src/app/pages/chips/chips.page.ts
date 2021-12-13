import range from 'lodash-es/range';
// import { range } from 'lodash-es';
import {
    ISuggestValues,
    SearchSourceFactory,
} from 'projects/angular/components/ui-chips/src/models';
import {
    Observable,
    of,
} from 'rxjs';
import {
    delay,
    map,
    switchMap,
    tap,
} from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';

@Component({
    selector: 'ui-chips-page',
    templateUrl: './chips.page.html',
    styleUrls: ['./chips.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsPageComponent {

    getResults(searchTerm: string): Observable<ISuggestValues<any>> {
        const options = range(1, 50).map(idx => ({
            id: idx,
            text: `Element ${idx}`,
        }));

        const filteredOptions = options.filter(option => option.text.includes(searchTerm));

        return of({
            total: filteredOptions.length,
            data: filteredOptions,
        });
    }

    searchSourceFactory: SearchSourceFactory<string> = (searchTerm = '', take = 5, skip = 0) => of(searchTerm).pipe(
        tap(() => console.info(`Requesting chunk [${skip}, ${skip + take}] for ${searchTerm}`)),
        switchMap(this.getResults),
        map(({ total, data }) => ({
            total,
            data: data?.splice(skip, skip + take),
        })),
        delay(500),
    );

}
