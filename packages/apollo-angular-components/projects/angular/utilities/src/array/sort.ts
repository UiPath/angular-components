export function sort<T, K extends keyof T>(array: T[], querySort?: string, locale = true): T[] {
    if (!querySort) {
        return array;
    }
    const sortDirection = querySort.startsWith('-') ? -1 : 1;
    const sortColumn: K = (sortDirection === 1 ? querySort : querySort.substring(1)) as K;
    return array.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        let result: number;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            result = aValue - bValue;
        } else {
            result = locale
                ? `${aValue}`.localeCompare(`${bValue}`)
                : aValue < bValue ? -1 : 1;
        }
        return result * sortDirection;
    });
}
