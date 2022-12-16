import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener } from '@angular/material/tree';
import {
    IFlatNodeObject, ITreeNode,
} from '../models/tree.models';

export class TreeUtils {
    static treeFlattener = new MatTreeFlattener<ITreeNode, IFlatNodeObject, string | number>(
        this.nodeTransformer,
        this.getNodeLevel,
        this.getIsNodeExpandable,
        this.getNodeChildren,
    );

    static nodeTransformer(node: ITreeNode, level: number) {
        return {
            key: node.key,
            name: node.name,
            data: node.data,
            level,
            hasChildren: !!node.children,
        };
    }

    static nodeBackTransformer(node: IFlatNodeObject): ITreeNode {
        return {
            key: node.key,
            name: node.name,
            data: node.data,
        };
    }

    static getNodeLevel({ level }: IFlatNodeObject) {
        return level;
    }

    static getIsNodeExpandable({ hasChildren }: IFlatNodeObject) {
        return hasChildren;
    }

    static getNodeChildren({ children }: ITreeNode) {
        return children;
    }

    static getNodeByKey(key: string, level: number, treeControl: FlatTreeControl<IFlatNodeObject, string | number>) {
        const node = treeControl.dataNodes.find(n => n.key === key);
        if (!node || node.level !== level) {
            throw new Error(`Node with key ${key} not found on level ${level} in the data array`);
        }
        return node;
    }

}

type TreeActionOptions = {
    emitEvent: boolean;
};

export const TREE_ACTION_DEFAULTS: TreeActionOptions = {
    emitEvent: true,
};
