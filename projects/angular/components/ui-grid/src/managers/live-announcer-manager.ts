import {
    NEVER,
    Observable,
    Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageChangeEvent } from '../events/page-change-event';
import { ISortModel } from '../models';
import { UiGridIntl } from '../ui-grid.intl';

/**
 * @internal
 * @ignore
 */
export class LiveAnnouncerManager<T> {
    private _destroyed$ = new Subject<void>();

    constructor(
        private _announce: (message: string) => void,
        intl: UiGridIntl,
        data$: Observable<T[]>,
        sort$: Observable<ISortModel<T>>,
        refresh$: Observable<void>,
        pageChange$: Observable<PageChangeEvent> = NEVER,
    ) {

        this._bindAnnouncement(
            pageChange$,
            pageChangeEvent => intl.loadingPage(pageChangeEvent.pageIndex + 1),
        );

        this._bindAnnouncement(
            refresh$,
            _ => intl.pageRefreshing,
        );

        let latestPageChangeEvent: PageChangeEvent;

        this._untilDestroyed(pageChange$)
            .subscribe(e => latestPageChangeEvent = e);

        this._bindAnnouncement(data$, items =>
            latestPageChangeEvent &&
            intl.loadedPage(
                latestPageChangeEvent.pageIndex + 1,
                items.length,
                latestPageChangeEvent.length,
            ),
        );

        this._bindAnnouncement(sort$, sortEvent => {
            return sortEvent.direction === 'asc' ? intl.columnSortedAscending(sortEvent.title)
                : sortEvent.direction === 'desc' ? intl.columnSortedDescending(sortEvent.title)
                    : intl.columnUnsorted(sortEvent.title);
        });
    }

    public destroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    private _bindAnnouncement<U>(source: Observable<U> | undefined, announcementBuilder: (data: U) => string) {
        return this._untilDestroyed(source).subscribe(
            data => this._announce(announcementBuilder(data)),
        );
    }

    private _untilDestroyed<U>(source?: Observable<U>) {
        if (source) {
            return source.pipe(takeUntil(this._destroyed$));
        }
        return NEVER;
    }
}
