export interface IVisibleModel<T> {
    property: keyof T | string;
    label: string;
    checked: boolean;
    disabled: boolean;
}
