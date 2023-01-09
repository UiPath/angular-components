import {
    CdkTreeModule, FlatTreeControl,
} from '@angular/cdk/tree';
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
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { UiContentLoaderModule } from '@uipath/angular/directives/ui-content-loader';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
    ITreeNode, IFlatNodeObject,
} from './models/tree.models';
import {
    TreeUtils, TREE_ACTION_DEFAULTS,
} from './utils/tree.utils';
import { UiTreeItemComponent } from './ui-tree-item/ui-tree-item.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatListModule,

        UiTreeItemComponent,
        UiContentLoaderModule,

        CdkTreeModule,
        ScrollingModule,
    ],
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
    itemTemplate?: any;

    @Input()
    itemSize = 26;

    /**
     * Path of keys key to the node that will be selected by default. The node must be present in the data array
     * If the node is a lower level node, the parent nodes must be present in the data array and then they will be expanded automatically
     */
    @Input()
    set initialSelection(value: string[] | null) {
        this._initialSelection = value ?? [];
        if (this._initialSelection.length > 0) {
            this._selectInitialNode();
        }
    }

    @HostBinding('style.--ui-tree-select-item-padding')
    @Input()
    itemPadding = '20px';

    /**
     * Emits an array of the selected nodes (keep in mind they are clones of the original nodes)
     */
    @Output()
    selected = new EventEmitter<ITreeNode[]>();

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
    set data(value: ITreeNode[] | null) {
        this._dataSource.data = value ?? [];
    }

    get dataSource() {
        return this._dataSource;
    }

    currentSelectedNodes = new Map<string, IFlatNodeObject>();

    private _keyManager!: FocusKeyManager<UiTreeItemComponent>;
    private _treeControl = new FlatTreeControl<IFlatNodeObject, string | number>(TreeUtils.getNodeLevel, TreeUtils.getIsNodeExpandable, {
        trackBy: (node) => node.key,
    });
    private _dataSource: MatTreeFlatDataSource<ITreeNode, IFlatNodeObject, string | number> = new MatTreeFlatDataSource(
        this._treeControl,
        TreeUtils.treeFlattener,
    );

    private _initialSelection: string[] = [];

    ngAfterViewInit() {
        this._keyManager = new FocusKeyManager(this.items);
        if (this._initialSelection.length) {
            this._selectInitialNode();
        }
    }

    onKeydown(event: KeyboardEvent) {
        this._preventDefault(event);
        const activeNode = this._keyManager.activeItem?.node;
        if (!activeNode) {
            this._keyManager.onKeydown(event);
            return;
        }

        const wasHandled = this._customKeydownHandle(event.key, activeNode);
        if (!wasHandled) {
            this._keyManager.onKeydown(event);
        }
    }

    isExpanded(node: IFlatNodeObject) {
        return this._treeControl.isExpanded(node);
    }

    isSelected(node: IFlatNodeObject) {
        return this.currentSelectedNodes.has(node.key);
    }

    trackById(_idx: number, node: IFlatNodeObject): TrackByFunction<IFlatNodeObject> {
        return node.key as any;
    }

    select(node: IFlatNodeObject, i = this._keyManager?.activeItemIndex, opts = TREE_ACTION_DEFAULTS) {
        if (i || i === 0) {
            this._keyManager?.updateActiveItem(i);
        }
        // NOTE: the `clear` call can be removed to implement multi-select
        this.currentSelectedNodes.clear();

        this.currentSelectedNodes.set(node.key, node);
        const selection = Array.from(this.currentSelectedNodes.values())
            .map(v => TreeUtils.nodeBackTransformer(v))
            .filter(Boolean) as ITreeNode[];

        if (opts.emitEvent) {
            this.selected.emit(selection);
        }
    }

    expand(node: IFlatNodeObject, opts = TREE_ACTION_DEFAULTS) {
        if (this._treeControl.isExpanded(node) || !node.hasChildren) {
            return;
        }
        this._treeControl.expand(node);
        if (opts.emitEvent) {
            this.expanded.emit(node);
        }
    }

    collapse(node: IFlatNodeObject) {
        if (!this._treeControl.isExpanded(node) || !node.hasChildren) {
            return;
        }

        this._treeControl.collapseDescendants(node);
        this._treeControl.collapse(node);
        this.collapsed.emit(node);
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

    private _preventDefault(event: KeyboardEvent) {
        if (event.key === ' ') {
            event.preventDefault();
        }
    }

    private _customKeydownHandle(eventKey: string, activeNode: IFlatNodeObject) {
        let wasHandled = false;
        if (['Enter', ' '].includes(eventKey)) {
            this.select(activeNode);
            wasHandled = true;
        }
        if (['ArrowRight', 'Right'].includes(eventKey)) {
            this.expand(activeNode);
            wasHandled = true;
        }
        if (['ArrowLeft', 'Left'].includes(eventKey)) {
            this.collapse(activeNode);
            wasHandled = true;
        }
        return wasHandled;
    }

    private _selectInitialNode() {
        this._initialSelection.forEach((key, i) => {
            const node = TreeUtils.getNodeByKey(key, i, this._treeControl);

            if (i < this._initialSelection.length - 1) {
                this.expand(node, { emitEvent: false });
            } else {
                const activeIndex = this._treeControl.dataNodes.findIndex(n => n.key === node.key);
                this.select(node, activeIndex, { emitEvent: false });
            }
        });
    }
}

