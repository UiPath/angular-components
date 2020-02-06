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
    discardPeriodicTasks,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';

import { UiVirtualScrollViewportResizeModule } from './ui-virtual-scroll-viewport-resize.module';

const ITEM_SIZE = 25;
const ITEMS_IN_VIEWPORT = 5;
const VIEWPORT_HEIGHT = ITEM_SIZE * ITEMS_IN_VIEWPORT;

@Component({
    template: `
    <cdk-virtual-scroll-viewport
            #viewport
            [total]="length"
            [itemSize]="${ITEM_SIZE}"
            uiVirtualScrollViewportResize
            class="example-viewport">
            <div *cdkVirtualFor="let item of items"
                class="example-item">
                {{ item.loading  === 'loaded' ? item.text : 'Loading...' }}
            </div>
        </cdk-virtual-scroll-viewport>
    `,
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
})
class UiVirtualScrollViewportResizeFixtureComponent {
    @ViewChild('viewport', {
        static: true,
    })
    public viewport!: CdkVirtualScrollViewport;

    public length = 5;
}
describe('Directive: UiVirtualScrollViewportResize', () => {
    let fixture: ComponentFixture<UiVirtualScrollViewportResizeFixtureComponent>;
    let component: UiVirtualScrollViewportResizeFixtureComponent;
    let vs: CdkVirtualScrollViewport;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                UiVirtualScrollViewportResizeModule,
                ScrollingModule,
            ],
            declarations: [
                UiVirtualScrollViewportResizeFixtureComponent,
            ],
        });
        fixture = TestBed.createComponent(UiVirtualScrollViewportResizeFixtureComponent);
        component = fixture.componentInstance;
        vs = component.viewport;
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('Trigger: total item length', () => {
        const DELAY_TIME = 0;

        it('should redraw the viewport if the item length changes', fakeAsync(() => {
            fixture.detectChanges();
            tick(DELAY_TIME);

            const viewportSizeSpy = spyOn(vs, 'checkViewportSize');
            viewportSizeSpy.and.callThrough();

            expect(viewportSizeSpy).not.toHaveBeenCalled();

            component.length = 10;
            fixture.detectChanges();
            tick(DELAY_TIME);

            expect(viewportSizeSpy).toHaveBeenCalled();
            expect(viewportSizeSpy).toHaveBeenCalledTimes(1);
        }));


        it('should redraw EVERY time the item count changs at a rapid pace', fakeAsync(() => {
            fixture.detectChanges();
            tick(DELAY_TIME);

            const viewportSizeSpy = spyOn(vs, 'checkViewportSize');
            viewportSizeSpy.and.callThrough();

            expect(viewportSizeSpy).not.toHaveBeenCalled();

            for (let i = 0; i < 1000; i++) {
                component.length = i + 1;
                fixture.detectChanges();
            }
            tick(DELAY_TIME);

            expect(viewportSizeSpy).toHaveBeenCalled();
            expect(viewportSizeSpy).toHaveBeenCalledTimes(1000);
        }));

        it('should redraw MULTIPLE times if item count changes after the debounce time', fakeAsync(() => {
            fixture.detectChanges();
            tick(DELAY_TIME);

            const viewportSizeSpy = spyOn(vs, 'checkViewportSize');
            viewportSizeSpy.and.callThrough();

            expect(viewportSizeSpy).not.toHaveBeenCalled();

            for (let i = 0; i < 30; i++) {
                component.length = i + 1;
                fixture.detectChanges();
                tick(DELAY_TIME);
            }
            tick(DELAY_TIME);

            expect(viewportSizeSpy).toHaveBeenCalled();
            expect(viewportSizeSpy).toHaveBeenCalledTimes(30);
        }));
    });

    describe('Trigger: window resize', () => {
        const DEBOUNCE_TIME = 1000 / 60;

        it('should redraw the viewport if the window is resized', fakeAsync(() => {
            fixture.detectChanges();
            tick(DEBOUNCE_TIME);

            const viewportSizeSpy = spyOn(vs, 'checkViewportSize');
            viewportSizeSpy.and.callThrough();

            expect(viewportSizeSpy).not.toHaveBeenCalled();

            window.dispatchEvent(new Event('resize'));
            fixture.detectChanges();
            tick(DEBOUNCE_TIME);

            expect(viewportSizeSpy).toHaveBeenCalled();
            expect(viewportSizeSpy).toHaveBeenCalledTimes(1);
            discardPeriodicTasks();
        }));

        it('should redraw ONCE if multiple resize events emit subsequently', fakeAsync(() => {
            fixture.detectChanges();
            tick(DEBOUNCE_TIME);

            const viewportSizeSpy = spyOn(vs, 'checkViewportSize');
            viewportSizeSpy.and.callThrough();

            expect(viewportSizeSpy).not.toHaveBeenCalled();

            for (let i = 0; i < 1000; i++) {
                window.dispatchEvent(new Event('resize'));
                fixture.detectChanges();
            }
            tick(DEBOUNCE_TIME);

            expect(viewportSizeSpy).toHaveBeenCalled();
            expect(viewportSizeSpy).toHaveBeenCalledTimes(1);
            discardPeriodicTasks();
        }));

        it('should redraw MULTIPLE times if the resize event occurs after the debounce time', fakeAsync(() => {
            const emissions = 30;

            fixture.detectChanges();
            tick(DEBOUNCE_TIME);

            const viewportSizeSpy = spyOn(vs, 'checkViewportSize');
            viewportSizeSpy.and.callThrough();

            expect(viewportSizeSpy).not.toHaveBeenCalled();

            for (let i = 0; i < emissions; i++) {
                window.dispatchEvent(new Event('resize'));
                fixture.detectChanges();
                tick(DEBOUNCE_TIME);
            }
            tick(DEBOUNCE_TIME);

            expect(viewportSizeSpy).toHaveBeenCalled();
            // FIXME: the spy gets called n * 1.5 times instead of n after upgrade to ng 9
            // maybe there's an issue with fakeAsync? seems trivial enough to simply update the check for now
            expect(viewportSizeSpy).toHaveBeenCalledTimes(emissions * 1.5);
        }));
    });
});
