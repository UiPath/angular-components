export interface ISelectionDiff<T> {
    add: Partial<T>[];
    remove: Partial<T>[];
}
