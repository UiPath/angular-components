import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UiVirtualScrollRangeLoaderDirective } from './ui-virtual-scroll-range-loader.directive';

@NgModule({
    imports: [
        CommonModule,
        ScrollingModule,
    ],
    declarations: [UiVirtualScrollRangeLoaderDirective],
    exports: [UiVirtualScrollRangeLoaderDirective],
})
export class UiVirtualScrollRangeLoaderModule { }
