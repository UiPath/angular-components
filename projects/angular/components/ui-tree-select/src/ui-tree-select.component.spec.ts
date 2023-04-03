/* eslint-disable @typescript-eslint/dot-notation */
import {
    Component,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UiTreeSelectComponent } from '@uipath/angular/components/ui-tree-select';
import { UiSpinnerButtonModule } from '@uipath/angular/directives/ui-spinner-button';
import { TreeUtils } from './utils/tree.utils';

const DATA_STUB = [
    {
        key: 'x',
        name: 'Folder A',
        data: null,
    },
    {
        key: 'y',
        name: 'Folder B',
        children: [],
        data: null,
    },
];

@Component({
    template: `<div class="test-host-container">
        <ui-tree-select
        [initialSelection]="initialSelection"
    [data]="data"
    [expandOnSelect]="expandOnSelect"
    (selected)="selected($event)"
    (expanded)="expanded($event)"
    (collapsed)="collapsed($event)">
    <p noDataMessage>no data</p>

    <ng-template #headerTemplate>
        <ng-container *ngIf="showHeaderTemplate">
            <div class="header">
                header template
            </div>
        </ng-container>
    </ng-template>

    <ng-template #itemTemplate
                 let-node="node"
                 let-expanded="expanded"
                 let-selected="selected"
                 let-loading="loading"
                 let-toggle="toggle">
        <button *ngIf="node.hasChildren"
                (click)="toggle($event)"
                [attr.aria-label]="expanded ? 'expand' : 'collapse'"
                [spinnerButtonLoading]="loading"
                uiSpinnerButton
                mat-icon-button
                class="toggle-button"
                type="button"
                tabindex="-1">
            <mat-icon>{{ !expanded ? 'expand_more' : 'chevron_right' }}</mat-icon>
        </button>
        <mat-icon>{{ expanded ? 'folder_open' : 'folder'}}</mat-icon>
        {{ node.name }}
    </ng-template>
    </ui-tree-select>

</div>`,
    styles: [`
    .test-host-container {
        height: 100%;
    }
        .ui-tree-select-container {
            height: 500px;
        }
    `],
    encapsulation: ViewEncapsulation.None,
})
export class TestHostComponent {
    @ViewChild(UiTreeSelectComponent)
    treeSelect!: UiTreeSelectComponent;
    data = DATA_STUB;
    selected = jasmine.createSpy();
    expanded = jasmine.createSpy();
    collapsed = jasmine.createSpy();
    initialSelection: string[] = [];
    expandOnSelect = false;
    showHeaderTemplate = false;
}

describe('UiTreeSelectComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, UiTreeSelectComponent, MatIconModule, MatButtonModule, UiSpinnerButtonModule],
            declarations: [TestHostComponent],
        }).compileComponents();
    });

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        flush();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

    }));

    it('should correctly render two items', fakeAsync(() => {
        expect(fixture.nativeElement.querySelectorAll('.tree-item-container').length).toBe(2);
    }));

    it('should correctly render no data message', () => {
        component.data = [];
        fixture.detectChanges();
        const nodes = fixture.nativeElement.querySelectorAll('.tree-item-container');
        expect(nodes.length).toBe(0);
        expect(fixture.nativeElement.textContent.trim()).toBe('no data');
    });

    it('should correctly render header template', () => {
        component.showHeaderTemplate = true;
        fixture.detectChanges();
        const headerElement = fixture.nativeElement.querySelector('.header');
        expect(headerElement).toBeTruthy();
        expect(headerElement.textContent.trim()).toBe('header template');
    });

    it('should correctly emit selected event', () => {
        const nodeWithChildren = fixture.nativeElement.querySelectorAll('.tree-item-container')[0];
        nodeWithChildren.click();
        fixture.detectChanges();
        expect(component.selected).toHaveBeenCalledWith(
            jasmine.arrayContaining([
                jasmine.objectContaining({ key: 'x' }),
            ]),
        );
    });

    it('should correctly treat expanded & collapsed events', () => {
        const firstNode = component.treeSelect.dataSource.data[0];
        // try to expand node with no children
        component.treeSelect.expand(TreeUtils.nodeTransformer(firstNode, 0) as any);
        expect(component.selected).not.toHaveBeenCalled();

        // try to collapse node with no children
        component.treeSelect.collapse(TreeUtils.nodeTransformer(firstNode, 0) as any);
        expect(component.collapsed).not.toHaveBeenCalled();

        // try to expand node with children
        const secondNode = component.treeSelect.dataSource.data[1];
        component.treeSelect.expand(TreeUtils.nodeTransformer(secondNode, 0) as any);
        expect(component.expanded).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'y' }));

        // try to expanded already expanded node
        component.treeSelect.expand(TreeUtils.nodeTransformer(secondNode, 0) as any);
        expect(component.expanded).toHaveBeenCalledTimes(1);

        // try to collapse node with children
        component.treeSelect.collapse(TreeUtils.nodeTransformer(secondNode, 0) as any);
        expect(component.collapsed).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'y' }));
    });

    it('should keep expansion state when changing data', () => {
        const secondNode = component.treeSelect.dataSource.data[1];
        component.treeSelect.expand(TreeUtils.nodeTransformer(secondNode, 0) as any);
        expect(component.expanded).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'y' }));

        component.data = [
            ...DATA_STUB,
            {
                key: 'z',
                name: 'Folder C',
                children: [],
                data: null,
            },
        ];
        fixture.detectChanges();
        expect(component.treeSelect.isExpanded(TreeUtils.nodeTransformer(secondNode, 0) as any)).toBe(true);
    });

    it('should correctly map kbd events to actions', () => {
        spyOn(component.treeSelect['_keyManager'], 'onKeydown');

        // select node when no focused node
        component.treeSelect.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(component.selected).not.toHaveBeenCalled();

        spyOnProperty(component.treeSelect['_keyManager'], 'activeItem').and.returnValue({ node: { key: 'x' } });
        component.treeSelect.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(component.selected).toHaveBeenCalledWith(
            jasmine.arrayContaining([
                jasmine.objectContaining({ key: 'x' }),
            ]),
        );

        // try to expand first node
        component.treeSelect.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        expect(component.expanded).not.toHaveBeenCalled();

        // try to collapse first node
        component.treeSelect.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        expect(component.collapsed).not.toHaveBeenCalled();

        const arrowDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        component.treeSelect.onKeydown(arrowDown);
        expect(component.treeSelect['_keyManager'].onKeydown).toHaveBeenCalledWith(arrowDown);

        const arrowUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        component.treeSelect.onKeydown(arrowUp);
        expect(component.treeSelect['_keyManager'].onKeydown).toHaveBeenCalledWith(arrowUp);
    });

    it('should correctly add leaf type class and render the expand toggle', () => {
        // select the item with no children
        const nodeWithNoChildren = fixture.nativeElement.querySelectorAll('.tree-item-container')[0];
        expect(nodeWithNoChildren.classList).toContain(`node-type-leaf`);
        expect(nodeWithNoChildren.querySelector('.toggle-button')).toBeFalsy();

        // select the item with children
        const nodeWithChildren = fixture.nativeElement.querySelectorAll('.tree-item-container')[1];
        expect(nodeWithChildren.classList).not.toContain(`node-type-leaf`);
        expect(nodeWithChildren.querySelector('.toggle-button')).toBeTruthy();
    });

    it('should correctly render the expanded chevron', () => {
        // select the item with children, check that the expand_more icon is rendered
        // then expand it and check that the chevron_right icon is rendered
        const nodeWithChildren = fixture.nativeElement.querySelectorAll('.tree-item-container')[1];
        expect(nodeWithChildren.querySelector('.toggle-button mat-icon').textContent).toBe('expand_more');

        // expand the node with children by using the toggle button
        nodeWithChildren.querySelector('.toggle-button').click();
        fixture.detectChanges();
        expect(nodeWithChildren.querySelector('.toggle-button mat-icon').textContent).toBe('chevron_right');
    });

    it('should correctly emit expanded or collapsed when toggle button is clicked', () => {
        // select the item with children
        const nodeWithChildren = fixture.nativeElement.querySelectorAll('.tree-item-container')[1];

        // expand the node with children by using the toggle button
        nodeWithChildren.querySelector('.toggle-button').click();
        fixture.detectChanges();
        expect(component.expanded).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'y' }));

        // collapse the node with children by using the toggle button
        nodeWithChildren.querySelector('.toggle-button').click();
        fixture.detectChanges();
        expect(component.collapsed).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'y' }));
    });

    it('should correctly select when `initialSelection` is passed', () => {
        expect(component.treeSelect.currentSelectedNodes.has('x')).toBeFalsy();
        component.initialSelection = ['x'];
        fixture.detectChanges();
        expect(component.treeSelect.currentSelectedNodes.has('x')).toBeTruthy();
    });

    it('should correctly expand and select a nested node', () => {
        component.data = [
            DATA_STUB[0],
            {
                ...DATA_STUB[1],
                children: [{ key: 'w' }] as any,
            },
        ];
        fixture.detectChanges();
        component.initialSelection = ['y', 'w'];
        fixture.detectChanges();
        expect(component.treeSelect.currentSelectedNodes.has('w')).toBeTruthy();
        expect(component.treeSelect.isExpanded(TreeUtils.nodeTransformer(component.data[1], 0) as any)).toBe(true);
    });

    it('should throw error if the consumer passes an invalid initialSelection', () => {
        component.initialSelection = ['invalidKey'];
        expect(() => fixture.detectChanges()).toThrowError(
            'Node with key invalidKey not found on level 0 in the data array',
        );
    });

    it('should select parent on arrow left', fakeAsync(() => {
        component.data = [
            DATA_STUB[0],
            {
                ...DATA_STUB[1],
                children: [{
                    key: 'w',
                    name: 'Folder C',
                }] as any,
            },
        ];
        fixture.detectChanges();
        component.initialSelection = ['y', 'w'];
        fixture.detectChanges();
        tick();
        component.treeSelect.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        expect(component.selected).toHaveBeenCalledWith(
            jasmine.arrayContaining([
                jasmine.objectContaining({ key: 'y' }),
            ]),
        );
    }));

    it('should correctly expand on select', () => {
        const nodeA = fixture.nativeElement.querySelectorAll('.tree-item-container')[0];
        nodeA.click();
        fixture.detectChanges();
        expect(component.expanded).not.toHaveBeenCalledWith();

        component.expandOnSelect = true;
        fixture.detectChanges();
        const nodeB = fixture.nativeElement.querySelectorAll('.tree-item-container')[1];
        nodeB.click();
        fixture.detectChanges();
        expect(component.expanded).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'y' }));
    });
});
