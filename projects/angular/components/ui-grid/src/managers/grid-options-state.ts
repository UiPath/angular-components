import { Injectable } from '@angular/core';

import { GridOptions } from '../models';
import { ResizeStrategy } from './resize/types/resizeStrategy';

export const DEFAULT_VIRTUAL_SCROLL_ITEM_SIZE = 48;

/**
 * Manager used for storing grid options.
 */

@Injectable()
export class GridOptionsManager<T> implements GridOptions<T> {
    fetchStrategy!: 'eager' | 'onOpen';
    resizeStrategy = ResizeStrategy.ImmediateNeighbourHalt;
    useCache?: boolean;
    collapsibleFilters?: boolean;
    collapseFiltersCount?: number;
    idProperty?: keyof T;
    rowSize = DEFAULT_VIRTUAL_SCROLL_ITEM_SIZE;
}
