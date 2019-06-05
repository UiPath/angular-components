import {
    Directive,
    Input,
} from '@angular/core';

import { IGridDataEntry } from '../models';

/**
 * Row configuration directive.
 *
 * @export
 */
@Directive({
    selector: '[uiGridRowConfig], ui-grid-row-config',
})
export class UiGridRowConfigDirective<T extends IGridDataEntry> {
  /**
   * Class function factory, used to apply `ngClass` on rows.
   *
   */
  @Input()
    public ngClassFn: (entry: T) => Record<string, boolean> = (_) => ({} as Record<string, boolean>)
}
