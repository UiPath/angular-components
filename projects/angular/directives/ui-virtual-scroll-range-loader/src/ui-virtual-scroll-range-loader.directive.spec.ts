import { ListRange } from '@angular/cdk/collections';
import {
    CdkVirtualScrollViewport,
    ScrollingModule,
} from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
    Component,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';

import {
    VirtualScrollItem,
    VirtualScrollItemStatus,
} from './ui-virtual-scroll-range-loader.directive';
import { UiVirtualScrollRangeLoaderModule } from './ui-virtual-scroll-range-loader.module';

const RANGE_LOAD_DEBOUNCE = 100;
const ITEM_SIZE = 25;
const ITEMS_IN_VIEWPORT = 5;
const VIEWPORT_HEIGHT = ITEM_SIZE * ITEMS_IN_VIEWPORT;
const INITIAL_ITEMS = new Array(VIEWPORT_HEIGHT * 100)
    .fill(0).map(_ => ({
        loading: VirtualScrollItemStatus.initial,
    }));

interface ITestVirtualScrollItem extends VirtualScrollItem {
    text?: string;
}

@Component({
    selector: `ui-virtual-scroll-component`,
    styles: [`
        .example-viewport {
            border: 1px solid black;
        }
        .example-viewport,
        .cdk-virtual-scroll-content-wrapper {
            height: ${VIEWPORT_HEIGHT}px;
            width: 300px;
        }

      .example-item {
        height: ${ITEM_SIZE}px;
        outline: 1px solid grey;
        width: 300px;
      }
    `],
    encapsulation: ViewEncapsulation.None,
    template: `<cdk-virtual-scroll-viewport #viewport
                                            [isDown]="isDown"
                                            [buffer]="buffer"
                                            [itemSize]="itemSize"
                                            (rangeLoad)="rangeLoad($event)"
                                            class="example-viewport"
                                            uiVirtualScrollRangeLoader>
                    <div *cdkVirtualFor="let item of items"
                        class="example-item">
                        {{ item.loading  === 'loaded' ? item.text : 'Loading...' }}
                    </div>
                </cdk-virtual-scroll-viewport>`,
})
class UiVirtualScrollRangeLoaderFixtureComponent {
    public isDown = true;
    public buffer = 0;
    public itemSize = ITEM_SIZE;
    public items: ITestVirtualScrollItem[] = INITIAL_ITEMS;

    public lastRangeLoad?: ListRange;

    @ViewChild('viewport', {
        static: true,
    })
    public viewport!: CdkVirtualScrollViewport;

    public rangeLoad(range: ListRange) {
        this.lastRangeLoad = range;
    }
}

describe('Directive: UiVirtualScrollRangeLoaderDirective', () => {
    let fixture: ComponentFixture<UiVirtualScrollRangeLoaderFixtureComponent>;
    let component: UiVirtualScrollRangeLoaderFixtureComponent;
    let vs: CdkVirtualScrollViewport;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                UiVirtualScrollRangeLoaderModule,
                ScrollingModule,
            ],
            declarations: [
                UiVirtualScrollRangeLoaderFixtureComponent,
            ],
        });
        fixture = TestBed.createComponent(UiVirtualScrollRangeLoaderFixtureComponent);
        component = fixture.componentInstance;
        vs = component.viewport;

    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('Behaviour: no buffer', () => {
        it('should create', fakeAsync(() => {
            fixture.detectChanges();

            tick(RANGE_LOAD_DEBOUNCE);

            expect(component).toBeDefined();
        }));

        it('should emit RangeLoad', fakeAsync(() => {
            fixture.detectChanges();

            tick(RANGE_LOAD_DEBOUNCE);

            expect(component.lastRangeLoad).toBeDefined();
        }));

        it('should emit RangeLoad equal to viewport range',
            fakeAsync(() => {
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const { end, start } = vs.getRenderedRange();
                expect(end).toEqual(component.lastRangeLoad!.end);
                expect(start).toEqual(component.lastRangeLoad!.start);
            }),
        );

        it('should emit RangeLoad equal to viewport range after scroll',
            fakeAsync(() => {
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const targetRange = {
                    start: 30,
                    end: 30 + ITEMS_IN_VIEWPORT,
                };

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const { end, start } = vs.getRenderedRange();
                expect(end).toEqual(component.lastRangeLoad!.end);
                expect(start).toEqual(component.lastRangeLoad!.start);
            }),
        );

        it('should not emit RangeLoad if range is invalid',
            fakeAsync(() => {
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const { end, start } = vs.getRenderedRange();
                const targetRange = {
                    start: 20,
                    end: 1,
                };

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);
                expect(end).toEqual(component.lastRangeLoad!.end);
                expect(start).toEqual(component.lastRangeLoad!.start);
            }),
        );

        it('should not emit RangeLoad if all items are loaded',
            fakeAsync(() => {
                component.items = component.items.map(_ => ({ loading: VirtualScrollItemStatus.loaded, text: 'Loaded' }));
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const targetRange = {
                    start: 30,
                    end: 40,
                };

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);
                expect(component.lastRangeLoad).toBeUndefined();
            }),
        );

        it('should emit  RangeLoad without the last item index if that is loaded',
            fakeAsync(() => {
                const targetRange = {
                    start: 0,
                    end: 10,
                };
                component.items = component.items
                    .map(
                        (_, i) => ({
                            loading: i === targetRange.end ? VirtualScrollItemStatus.loaded : VirtualScrollItemStatus.initial,
                            text: 'Loaded',
                        }),
                    );
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);
                expect(component.lastRangeLoad!.end).toBe(targetRange.end - 1);
            }),
        );

        it('should emit  RangeLoad without the last item index if that is loaded',
            fakeAsync(() => {
                const targetRange = {
                    start: 0,
                    end: 10,
                };
                component.items = component.items
                    .map(
                        (_, i) => ({
                            loading: (i === targetRange.end || i === targetRange.start) ?
                                VirtualScrollItemStatus.loaded :
                                VirtualScrollItemStatus.initial,
                            text: 'Loaded',
                        }),
                    );
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);
                expect(component.lastRangeLoad!.end).toBe(targetRange.end - 1);
                expect(component.lastRangeLoad!.start).toBe(targetRange.start + 1);
            }),
        );
    });

    describe('Behaviour: with buffer', () => {
        beforeEach(() => {
            component.buffer = 5;
        });

        it('should create', fakeAsync(() => {
            fixture.detectChanges();

            tick(RANGE_LOAD_DEBOUNCE);

            expect(component).toBeDefined();
        }));

        it('should emit RangeLoad', fakeAsync(() => {
            fixture.detectChanges();

            tick(RANGE_LOAD_DEBOUNCE);

            expect(component.lastRangeLoad).toBeDefined();
        }));

        it('should emit RangeLoad equal to viewport range plus buffer on first load',
            fakeAsync(() => {
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const { end, start } = vs.getRenderedRange();
                expect(end + component.buffer).toEqual(component.lastRangeLoad!.end);
                expect(start).toEqual(component.lastRangeLoad!.start);
            }),
        );

        it('should emit RangeLoad equal to viewport range after scroll',
            fakeAsync(() => {
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const targetRange = {
                    start: 30,
                    end: 30 + ITEMS_IN_VIEWPORT,
                };

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const { end, start } = vs.getRenderedRange();
                expect(end + component.buffer).toEqual(component.lastRangeLoad!.end);
                expect(start - component.buffer).toEqual(component.lastRangeLoad!.start);
            }),
        );

        it('should emit RangeLoad with buffer at end even if it contains items in loaded state',
            fakeAsync(() => {
                const targetRange = {
                    start: 0,
                    end: 10,
                };
                component.items = component.items
                    .map(
                        (_, i) => ({
                            loading: (i === targetRange.end) ?
                                VirtualScrollItemStatus.loaded :
                                VirtualScrollItemStatus.initial,
                            text: 'Loaded',
                        }),
                    );
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                vs.setRenderedRange(targetRange);
                vs.setRenderedContentOffset(5 * ITEM_SIZE);
                vs.scrollToIndex(5);
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                expect(component.lastRangeLoad!.end).toBe(targetRange.end + component.buffer);
                expect(component.lastRangeLoad!.start).toBe(targetRange.start);
            }),
        );
    });

    describe('Behaviour: reversed', () => {
        beforeEach(() => {
            component.isDown = false;
        });

        it('should emit RangeLoad', fakeAsync(() => {
            fixture.detectChanges();

            tick(RANGE_LOAD_DEBOUNCE);

            expect(component.lastRangeLoad).toBeDefined();
        }));

        it('should emit RangeLoad equal to viewport range with indexes reversed',
            fakeAsync(() => {
                fixture.detectChanges();

                tick(RANGE_LOAD_DEBOUNCE);

                const { end, start } = vs.getRenderedRange();
                expect(start).toEqual((component.items.length - 1) - component.lastRangeLoad!.end);
                expect(end).toEqual((component.items.length - 1) - component.lastRangeLoad!.start);
            }),
        );
    });

});
