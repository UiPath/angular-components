import { fakeAsync } from '@angular/core/testing';
import {
    createPipeFactory,
    SpectatorPipe,
} from '@ngneat/spectator';

import { UiFileSizePipe as SuT } from './file-size.pipe';

describe('UiFileSizePipe', () => {

    let spectator: SpectatorPipe<SuT>;
    const createPipe = createPipeFactory({
        pipe: SuT,
    });

    [ null, undefined, '', NaN ].forEach(entry =>
        it('should map null, undefined, NaN, or empty string to 0 B', fakeAsync(() => {
            spectator = createPipe('{{ entry | uiFileSize | async }}', { hostProps: { entry } });

            expect(spectator.element.textContent).toBe('0 B');
        })),
    );

    [
        {
            size: 0,
            expectedUnits: 'B',
            expectedSize: 0,
        },
        {
            size: 1023,
            expectedUnits: 'B',
            expectedSize: '1,023',
        },
        {
            size: 1024,
            expectedUnits: 'KB',
            expectedSize: '1',
        },
        {
            size: 1024 * 1024 - 1,
            expectedUnits: 'KB',
            expectedSize: '1,024',
        },
        {
            size: 1024 * 1024,
            expectedUnits: 'MB',
            expectedSize: '1',
        },
        {
            size: 1024 * 1024 * 1024 - 1,
            expectedUnits: 'MB',
            expectedSize: '1,024',
        },
        {
            size: 1024 * 1024 * 1024,
            expectedUnits: 'GB',
            expectedSize: '1',
        },
        {
            size: 1024 * 1024 * 1024 * 1024,
            expectedUnits: 'GB',
            expectedSize: '1,024',
        },
    ].forEach(entry =>
        it(`should map size ${entry.size} to ${entry.expectedSize} ${entry.expectedUnits}`, () => {
            spectator = createPipe('{{ size | uiFileSize | async }}', { hostProps: { size: entry.size } });

            expect(spectator.element.textContent).toBe(`${entry.expectedSize} ${entry.expectedUnits}`);
        }),
    );
});
