import { NgModule } from '@angular/core';

import { UiVirtualScrollViewportResizeDirective } from './ui-virtual-scroll-viewport-resize.directive';

@NgModule({
    declarations: [UiVirtualScrollViewportResizeDirective],
    exports: [UiVirtualScrollViewportResizeDirective],
})
export class UiVirtualScrollViewportResizeModule { }
