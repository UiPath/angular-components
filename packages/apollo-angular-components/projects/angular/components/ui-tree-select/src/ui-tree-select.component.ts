import {
    CdkTreeModule, FlatTreeControl,
} from '@angular/cdk/tree';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    QueryList,
    TrackByFunction,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';

import { MatTreeFlatDataSource } from '@angular/material/tree';

import { FocusKeyManager } from '@angular/cdk/a11y';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { UiContentLoaderModule } from '@uipath/angular/directives/ui-content-loader';
import {
    CdkVirtualScrollViewport, ScrollingModule,
} from '@angular/cdk/scrolling';
import {
    BehaviorSubject, EMPTY, map, Subject, switchMap, take, takeUntil, tap,
} from 'rxjs';
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
export class UiTreeSelectComponent implements AfterViewInit, OnDestroy {

    @ViewChildren(UiTreeItemComponent)
    items!: QueryList<UiTreeItemComponent>;

    @ContentChild('itemTemplate')
    itemTemplate?: any;

    @Input()
    itemSize = 26;

    @Input()
    expandOnSelect = false;

    @Input()
    loading = false;

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

    @ViewChild(CdkVirtualScrollViewport)
    viewport?: CdkVirtualScrollViewport;

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

    private _connectedData$ = new BehaviorSubject<IFlatNodeObject[]>([]);
    private _selectNode$ = new Subject<IFlatNodeObject>();
    private _destroyed$ = new Subject<void>();

    constructor(private _cd: ChangeDetectorRef) {
        // eslint-disable-next-line rxjs/finnish
        this.dataSource.connect({ viewChange: EMPTY }).pipe(
            takeUntil(this._destroyed$),
        ).subscribe(allData => {
            this._connectedData$.next(allData);
        });

        this._selectNode$.pipe(
            switchMap((node) => this._connectedData$.pipe(
                take(1),
                map(allNodes => ({
                    node,
                    allNodes,
                })),
            )),
            tap(({ node, allNodes }) => {
                const nodeIndex = allNodes.findIndex(n => n.key === node.key);
                if (!this._isNodeInViewport(node)) {
                    this.viewport?.scrollToIndex(nodeIndex);
                }
            }),
            takeUntil(this._destroyed$),
        ).subscribe(({ node }) => {
            const nodeIndex = this._convertKeyToRenderedItemsIndex(node.key);
            queueMicrotask(() => {
                this._keyManager.setActiveItem(nodeIndex);
                this._cd.detectChanges();
            });
        });
    }

    ngAfterViewInit() {
        this._keyManager = new FocusKeyManager(this.items);
        if (this._initialSelection.length) {
            this._selectInitialNode();
        }
    }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
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

    select(node: IFlatNodeObject, opts = TREE_ACTION_DEFAULTS) {
        this._selectNode$.next(node);
        // NOTE: the `clear` call can be removed to implement multi-select
        this.currentSelectedNodes.clear();

        this.currentSelectedNodes.set(node.key, node);
        const selection = Array.from(this.currentSelectedNodes.values())
            .map(v => TreeUtils.nodeBackTransformer(v))
            .filter(Boolean) as ITreeNode[];

        if (opts.emitEvent) {
            this.selected.emit(selection);
        }
        if (this.expandOnSelect) {
            this.expand(node, { emitEvent: true });
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
            this._handleArrowLeft(activeNode);
            wasHandled = true;
        }
        return wasHandled;
    }

    private _selectInitialNode() {
        this._initialSelection.forEach((key, i) => {
            const node = TreeUtils.getNodeByKey(key, i, this._treeControl);

            if (i < this._initialSelection.length - 1) {
                this.expand(node, { emitEvent: false });
                // generally expand doesn't need cd, but in this case we want it
                // in order to have the children visible for selection or further expansion
                this._cd.detectChanges();
            } else {
                this.select(node, { emitEvent: false });
            }
        });
    }

    private _handleArrowLeft(activeNode: IFlatNodeObject) {
        if (activeNode.hasChildren && this._treeControl.isExpanded(activeNode)) {
            this.collapse(activeNode);
            return;
        }
        const activeIndex = this._treeControl.dataNodes.findIndex(n => n.key === activeNode.key);
        const parent = TreeUtils.getParentNode(activeIndex, activeNode.level, this._treeControl.dataNodes);
        if (activeNode.level > 0 && parent) {
            const parentIndex = this._treeControl.dataNodes.findIndex(n => n.key === parent.key);
            this._keyManager.setActiveItem(parentIndex);
            this.select(parent);
        } else {
            this.collapse(activeNode);
        }
    }

    private _isNodeInViewport(node: IFlatNodeObject) {
        const viewport = this.viewport;
        if (!viewport) {
            return false;
        }
        const viewportRange = viewport.getRenderedRange();
        const nodeIndex = this._connectedData$.value.findIndex(n => n.key === node.key);
        const isInRenderedRange = nodeIndex >= viewportRange.start && nodeIndex <= viewportRange.end;
        if (!isInRenderedRange) {
            return false;
        }
        const viewportBoundingRect = viewport.elementRef.nativeElement.getBoundingClientRect();
        const nodeBoundingRect = this.items.find(n => n.node.key === node.key)?.getBoundingClientRect();
        if (!nodeBoundingRect) {
            return false;
        }
        return ((viewportBoundingRect.top + viewportBoundingRect.height) - nodeBoundingRect.bottom) > 0;
    }

    /**
     * The index of an item in the rendered items array (or the list manager items)
     * is different than the index of an item in the initial data array
     *
     * @param key the key of a node
     * @returns the index of the node in the rendered items array
     */
    private _convertKeyToRenderedItemsIndex(key: string) {
        return this.items.toArray().findIndex(i => i.node.key === key);
    }
}

