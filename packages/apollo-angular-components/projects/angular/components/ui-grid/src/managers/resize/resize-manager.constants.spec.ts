
import {
    IResizeEvent,
    IResizeInfo,
} from '../resize/types';
import {
    clampOffset,
    isDirectionChanged,
    isMinWidth,
} from './resize-manager.constants';

describe('Manager: ResizeManager', () => {
    describe('Utility: isMinWidth', () => {
        it('should return FALSE if the entry is not defined', () => {
            expect(isMinWidth()).toEqual(false);
        });

        it('should return FALSE if the width is not equal to the minWidth', () => {
            const entry = {
                element: {
                    style: {
                        width: '100px',
                    },
                },
                column: {
                    minWidth: 70,
                },
            } as IResizeInfo<{}>;

            expect(isMinWidth(entry)).toEqual(false);
        });

        it('should return TRUE if the width is equal to the minWidth', () => {
            const entry = {
                element: {
                    style: {
                        width: '100px',
                    },
                },
                column: {
                    minWidth: 100,
                },
            } as IResizeInfo<{}>;

            expect(isMinWidth(entry)).toEqual(true);
        });
    });

    describe('Utility: isDirectionChanged', () => {
        it('should return TRUE if the current direction is not equal to the previous', () => {
            const state = {
                current: {
                    direction: 'left',
                },
                previous: {
                    direction: 'right',
                },
            } as unknown as IResizeEvent<object>;

            expect(isDirectionChanged(state)).toEqual(true);
        });

        it('should return FALSE if the current direction is equal to the previous', () => {
            const state = {
                current: {
                    direction: 'right',
                },
                previous: {
                    direction: 'right',
                },
            } as unknown as IResizeEvent<object>;

            expect(isDirectionChanged(state)).toEqual(false);
        });
    });

    describe('Utility: clampOffset', () => {
        it('should return the offset if the entry is not defined', () => {
            expect(clampOffset(void 0, 100)).toEqual(100);
        });

        it('should return the current offset if the width has not reached the defined limit', () => {
            const entry = {
                column: {
                    width: 100,
                    minWidth: 50,
                },
            } as IResizeInfo<{}>;

            expect(clampOffset(entry, -30)).toEqual(-30);
        });

        it('should return the clamped offset if the is below the limit (compensate)', () => {
            const entry = {
                column: {
                    width: 40,
                    minWidth: 50,
                },
            } as IResizeInfo<{}>;

            expect(clampOffset(entry, -30)).toEqual(10);
        });
    });
});
