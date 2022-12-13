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
import { BehaviorSubject } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { UiContentLoaderModule } from '@uipath/angular/directives/ui-content-loader';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
    ITreeNode, IFlatNodeObject,
} from './models/tree.models';
import { TreeUtils } from './utils/tree.utils';
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
    itemTemplate!: any;

    @Input()
    itemSize = 26;

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
    set data(value: ITreeNode[]) {
        this._dataSource.data = value;
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

    ngAfterViewInit() {
        this._keyManager = new FocusKeyManager(this.items);
    }

    onKeydown(event: KeyboardEvent) {
        const activeNode = this._keyManager.activeItem?.node;
        if (activeNode) {
            if (event.key === 'Enter') {
            this.select(activeNode);
            return;
        }
            if (['ArrowRight', 'Right'].includes(event.key)) {
            this.expand(activeNode);
            return;
        }
            if (['ArrowLeft', 'Left'].includes(event.key)) {
            this.collapse(activeNode);
            return;
        }
        }

        this._keyManager.onKeydown(event);
    }

    isExpanded(node: IFlatNodeObject) {
        return this._treeControl.isExpanded(node);
    }

    isSelected(node: IFlatNodeObject) {
        return this.currentSelectedNode.has(node.key);
    }

    trackById(_idx: number, node: IFlatNodeObject): TrackByFunction<IFlatNodeObject> {
        return node.key as any;
    }

    select(node: IFlatNodeObject, i?: number) {
        if (i !== undefined && this._keyManager?.activeItemIndex !== i) {
            this._keyManager?.updateActiveItem(i);
        }
        // NOTE: the `clear` call can be removed to implement multi-select
        this.currentSelectedNode.clear();

        this.currentSelectedNode.set(node.key, node);
        const selection = Array.from(this.currentSelectedNode.values())
            .map(v => TreeUtils.nodeBackTransformer(v))
            .filter(Boolean) as ITreeNode[];
        this.selected.emit(selection);
    }

    expand(node: IFlatNodeObject) {
        if (this._treeControl.isExpanded(node) || !node.hasChildren) {
            return;
        }
        this._treeControl.expand(node);
        this.expanded.emit(node);
        }
    }

    collapse(node: IFlatNodeObject) {
        if (!this._treeControl.isExpanded(node) || !node.hasChildren) {
            return;
        }
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
}

