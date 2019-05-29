export interface IFilterModel<T> {
    property: keyof T | string;
    method: string;
    value: string | number | Date | boolean | [];
    type?: string;
}
