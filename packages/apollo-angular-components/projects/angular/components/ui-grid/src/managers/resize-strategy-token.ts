import { BehaviorSubject } from 'rxjs';

import { InjectionToken } from '@angular/core';

import { ResizeStrategy } from './resize/types/resizeStrategy';

export const UI_GRID_RESIZE_STRATEGY_STREAM = new InjectionToken<BehaviorSubject<ResizeStrategy>>('resize-strategy-stream');
