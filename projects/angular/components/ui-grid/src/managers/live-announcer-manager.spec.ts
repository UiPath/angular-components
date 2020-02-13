import { Subject } from 'rxjs';

import { PageChangeEvent } from '../events/page-change-event';
import { LiveAnnouncerManager } from '../managers';
import { ISortModel } from '../models';
import { UiGridIntl } from '../ui-grid.intl';

describe('Component: UiGrid', () => {

    describe('Manager: LiveAnnouncerManager', () => {
        const TOTAL_ITEMS = 300;
        const PAGE_SIZE = 100;
        const PAGE_DATA = Array(PAGE_SIZE).fill({});
        const PAGE_NO = 2;
        const pageChange = { length: TOTAL_ITEMS, pageIndex: PAGE_NO - 1, pageSize: PAGE_SIZE, previousPageIndex: 0 };

        const intl = new UiGridIntl();
        const refresh$ = new Subject<void>();
        const pageChange$ = new Subject<PageChangeEvent>();
        const data$ = new Subject<{}[]>();
        const sort$ = new Subject<ISortModel<{}>>();

        let announcer: LiveAnnouncerManager<{}>;
        let announceSpy: jasmine.Spy<InferableFunction>;

        beforeEach(() => {
            announceSpy = jasmine.createSpy();
            // tslint:disable-next-line: no-unused-expression
            announcer = new LiveAnnouncerManager(announceSpy, intl, data$, sort$, refresh$, pageChange$);
        });

        it('should announce after refresh', () => {
            refresh$.next();
            expect(announceSpy).toHaveBeenCalledWith(intl.pageRefreshing);
        });

        it('should announce page change', () => {
            pageChange$.next(pageChange);
            expect(announceSpy).toHaveBeenCalledWith(intl.loadingPage(PAGE_NO));
        });

        it('should announce new data after page change with known total number of items', () => {
            pageChange$.next(pageChange);
            data$.next(PAGE_DATA);

            expect(announceSpy.calls.all()[0].args).toEqual([intl.loadingPage(PAGE_NO)]);
            expect(announceSpy.calls.all()[1].args).toEqual([intl.loadedPage(PAGE_NO, PAGE_SIZE, TOTAL_ITEMS)]);
        });

        [
            undefined, null, NaN,
        ].forEach(total => {
            it(`should announce new data after page change with unknown (${total}) total number of items`, () => {
                pageChange$.next({...pageChange, length: total});
                data$.next(PAGE_DATA);

                expect(announceSpy.calls.all()[0].args).toEqual([intl.loadingPage(PAGE_NO)]);
                expect(announceSpy.calls.all()[1].args).toEqual([intl.loadedPage(PAGE_NO, PAGE_SIZE)]);
            });
        });

        it('should not announce if destroyed', () => {
            announcer.destroy();
            refresh$.next();
            expect(announceSpy).toHaveBeenCalledTimes(0);
        });
    });
});
