interface IBaseNode<T = any> {
    key: string;
    name: string;
    data?: T;
}

export interface ITreeNode<T = any> extends IBaseNode<T> {
    children?: ITreeNode<T>[];
}

export interface IFlatNodeObject<T = any> extends IBaseNode<T> {
    hasChildren: boolean;
    level: number;
}
