import {
    IResizeEvent,
    IResizeInfo,
} from './types';

/**
 * @ignore
 */
export const HEADER_DATA_KEY = 'identifier';

/**
 * Determines if the style has reached it's minimum width.
 *
 * @export
 * @param entry The verified entry.
 * @returns If the entry has reached it's minimum width.
 * @internal
 * @ignore
 */
export function isMinWidth<T>(entry?: IResizeInfo<T>) {
    return !!entry && parseInt(entry.element.style.width!, 10) === entry.column.minWidth;
}

/**
 * Detects if the resize direction has changed compared to it's previous state.
 *
 * @export
 * @param state The resize state that needs to be checked.
 * @returns If the resize direction has changed.
 * @internal
 * @ignore
 */
export function isDirectionChanged<T>(state: IResizeEvent<T>) {
    return state.previous.direction != null &&
        state.previous.direction !== state.current.direction;
}

/**
 * Clamps the offset value in a safe range.
 *
 * @export
 * @param entry The entry that needs to be clamped.
 * @param offset The current `offset`.
 * @returns The clamped `offset` for the provided entry
 * @internal
 * @ignore
 */
export function clampOffset<T>(entry: IResizeInfo<T> | undefined, offset: number) {
    if (!entry) { return offset; }

    const width = entry.column.width as number + offset;

    if (width < entry.column.minWidth) {
        return entry.column.minWidth - (entry.column.width as number);
    }

    return offset;
}

/**
 * Filters events if no dragging actually occured.
 *
 * @param state The current resize state.
 * @returns If the current resize event should be filtered.
 * @internal
 * @ignore
 */
export const resizeFilter = <T>(state: IResizeEvent<T>) => {
    const isDragging = Math.abs(state.current.offsetPx) !== state.current.resized.dragInitX;

    const isSameOffset = state.current.offsetPx === state.previous.offsetPx ||
        state.current.offsetPercent === state.previous.offsetPercent ||
        !state.current.offsetPercent;

    // if no actual drag occured skip
    if (
        !isDragging ||
        isSameOffset
    ) { return false; }

    return true;
};

/**
 *  Returns the query selector for cell elements.
 *
 * @param value The data value.
 * @returns The selector for the requested value.
 * @internal
 * @ignore
 */
export const cellSelector = (value: string) => `.ui-grid-cell[data-${HEADER_DATA_KEY}='${value}']`;

/**
 *  Scales the width value accordingly.
 *
 * @param value The value that needs to be formatted as a percentage.
 * @returns The formatted value
 * @internal
 * @ignore
 */
export const toPercentageStyle = (value: number) => `${value}%`;

/**
 * Searches for the header index associated to the requested data property.
 *
 * @param headers The header list.
 * @param value The header identifier value.
 * @internal
 * @ignore
 */
export const findHeaderIndexFor = (headers: HTMLDivElement[], value: string) =>
    headers.findIndex(h => h.dataset[HEADER_DATA_KEY] === value);


/**
 * Gets the data property value for the current element.
 *
 * @param element The element on which to search for the identifier.
 * @returns The identifier value.
 * @internal
 * @ignore
 */
export const getProperty = (element: HTMLDivElement) =>
    element.dataset[HEADER_DATA_KEY]!;
