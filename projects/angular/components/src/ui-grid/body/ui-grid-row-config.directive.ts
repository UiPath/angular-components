import {
  Directive,
  Input,
} from '@angular/core';

import { IGridDataEntry } from '../models';

@Directive({
    selector: '[uiGridRowConfig], ui-grid-row-config',
})
export class UiGridRowConfigDirective<T extends IGridDataEntry> {
    @Input()
    public ngClassFn: (entry: T) => Record<string, boolean> = (_) => ({} as Record<string, boolean>)
}
