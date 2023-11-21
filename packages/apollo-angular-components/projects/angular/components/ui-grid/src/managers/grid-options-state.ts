import { Injectable } from '@angular/core';

import { GridOptions } from '../models';
import { ResizeStrategy } from './resize/types/resizeStrategy';

/**
 * Manager used for storing grid options.
 */

@Injectable()
export class GridOptionsManager<T> implements GridOptions<T> {
    fetchStrategy!: 'eager' | 'onOpen';
    resizeStrategy = ResizeStrategy.ImmediateNeighbourHalt;
}
