import { FlatTreeControl } from '@angular/cdk/tree';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    QueryList,
    TrackByFunction,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';

import { MatTreeFlatDataSource } from '@angular/material/tree';

import { FocusKeyManager } from '@angular/cdk/a11y';
import { BehaviorSubject } from 'rxjs';
import { UiTreeItemComponent } from './ui-tree-item/ui-tree-item.component';
import { TreeUtils } from './utils/tree.utils';
import {
    ITreeNode, IFlatNodeObject,
} from './models/tree.models';

@Component({
    selector: 'ui-tree-select',
    templateUrl: './ui-tree-select.component.html',
    styleUrls: ['./ui-tree-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiTreeSelectComponent implements AfterViewInit {

    @ViewChildren(UiTreeItemComponent)
    items!: QueryList<UiTreeItemComponent>;

    @ContentChild('itemTemplate')
    itemTemplate!: any;

    @Input()
    itemSize = 26;

    @HostBinding('style.--ui-tree-select-item-padding')
    @Input()
    itemPadding = '20px';

    /**
     * Emits a clone of the original node when it's selected
     */
    @Output()
    selected = new EventEmitter<ITreeNode | null>();

    /**
     * Emits a clone of the original node when it's expanded
     */
    @Output()
    expanded = new EventEmitter<ITreeNode>();

    /**
     * Emits a clone of the original node when it's collapsed
     */
    @Output()
    collapsed = new EventEmitter<ITreeNode>();

    /**
     * An array of nodes. Keep in mind they will be flattened when rendered in the tree
     */
    @Input()
    set data(value: ITreeNode[]) {
        this._dataSource.data = value;
        this.loadingFolderExpansion$.next({
            value: false,
        });
    }

    get dataSource() {
        return this._dataSource;
    }

    loadingFolderExpansion$ = new BehaviorSubject<LoadingFolderExpansion>({ value: false });
    currentSelectedNode: IFlatNodeObject | null = null;

    private _keyManager!: FocusKeyManager<UiTreeItemComponent>;
    private _treeControl = new FlatTreeControl<IFlatNodeObject, string | number>(TreeUtils.getNodeLevel, TreeUtils.getIsNodeExpandable, {
        trackBy: (node) => node.key,
    });
    private _dataSource: MatTreeFlatDataSource<ITreeNode, IFlatNodeObject, string | number> = new MatTreeFlatDataSource(
        this._treeControl,
        TreeUtils.treeFlattener,
    );

    ngAfterViewInit() {
        this._keyManager = new FocusKeyManager(this.items);
    }

    onKeydown(event: KeyboardEvent) {
        const selected = this._keyManager.activeItem?.node;
        if (event.key === 'Enter') {
            this.select(selected ?? null);
            return;
        }
        if (['ArrowRight', 'Right'].includes(event.key) && selected) {
            this.expand(selected);
            return;
        }
        if (['ArrowLeft', 'Left'].includes(event.key) && selected) {
            this.collapse(selected);
            return;
        }
        this._keyManager.onKeydown(event);
    }

    isExpanded(node: IFlatNodeObject) {
        return this._treeControl.isExpanded(node);
    }

    isSelected(node: IFlatNodeObject) {
        return node.key === this.currentSelectedNode?.key;
    }

    trackById(_idx: number, node: IFlatNodeObject): TrackByFunction<IFlatNodeObject> {
        return node.key as any;
    }

    select(node: IFlatNodeObject | null, i?: number) {
        if (i !== undefined && this._keyManager?.activeItemIndex !== i) {
            this._keyManager?.updateActiveItem(i);
        }
        this.selected.emit(node != null ? TreeUtils.nodeBackTransformer(node) : null);
        this.currentSelectedNode = node;
    }

    expand(node: IFlatNodeObject) {
        if (this._treeControl.isExpanded(node) || !node.hasChildren) {
            return;
        }
        this._treeControl.expand(node);
        this.expanded.emit(node);
        this.loadingFolderExpansion$.next({
            value: true,
            key: node.key,
        });
    }

    collapse(node: IFlatNodeObject) {
        if (!this._treeControl.isExpanded(node) || !node.hasChildren) {
            return;
        }
        this._treeControl.collapse(node);
        this.collapsed.emit(node);
        this.loadingFolderExpansion$.next({
            value: false,
            key: undefined,
        });
    }

    toggle(node: IFlatNodeObject) {
        return ($event: MouseEvent) => {
            $event.stopPropagation();
            if (this._treeControl.isExpanded(node)) {
                this.collapse(node);
            } else {
                this.expand(node);
            }
        };
    }
}

type LoadingFolderExpansion = {
    value: boolean;
    key?: string;
};
