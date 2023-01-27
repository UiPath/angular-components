import { InjectionToken } from '@angular/core';

/**
 * Temporary token for using Luxon instead of moment.
 * After Luxon becomes the default, this token can be removed.
 *
 */
export const USE_LUXON = new InjectionToken<boolean>('Token for using Luxon instead of moment.');
