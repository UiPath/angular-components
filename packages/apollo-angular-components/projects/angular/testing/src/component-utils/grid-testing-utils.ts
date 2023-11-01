import { HttpTestingController } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import {
    discardPeriodicTasks,
    flush,
    tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EventGenerator } from '../utilities/event-generator';
import {
    FixtureTestingUtils,
    IStubEndpoint,
} from '../utilities/fixture-testing-utils';

const selectors = {
    grid: 'ui-grid',
    inlineMenu: '[data-cy="grid-action-menu"]',
};

export class GridUtils<T> {
    constructor(
        private _utils: FixtureTestingUtils<T>,
    ) { }

    flush = (stub: IStubEndpoint, httpClient: HttpTestingController) => {
        this._utils.fixture.detectChanges();
        tick(500);
        this._utils.fixture.detectChanges();

        this._utils.expectAndFlush(stub, httpClient);
        this._utils.fixture.detectChanges();

        flush();
        discardPeriodicTasks();
    };

    /**
     *
     * @param rowNumber The Grid row
     *
     * ---
     *
     * @param startColumn The beginning of the specified portion of the array.
     * @param endColumn The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    getCellsText = (
        rowNumber: number,
        {
            startColumn,
            endColumn,
            gridSelector,
            debugEl,
            getter = (cellEl: DebugElement) => cellEl.nativeElement.innerText as string,
        }: {
            startColumn?: number;
            endColumn?: number;
            gridSelector?: string;
            debugEl?: DebugElement;
            getter?: (cellEl: DebugElement, index: number, array: DebugElement[]) => string;
        } = {
                getter: (cellEl: DebugElement) => cellEl.nativeElement.innerText as string,
            },
    ) => {
        const rowEl = this._utils.getDebugElement(`${gridSelector ?? selectors.grid} [data-row-index="${rowNumber - 1}"]`, debugEl);
        return rowEl
            .queryAll(By.css('.ui-grid-cell'))
            .slice(startColumn, endColumn)
            .map(getter);
    };

    getHeaders = (gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) =>
        this._utils.getAllDebugElements(`${gridSelector} .ui-grid-header-cell`, debugEl)
            .filter(el => this._utils.getDebugElement('.ui-grid-header-title:not(ui-grid ui-grid .ui-grid-header-title)', el));

    getColumnsProperties = (gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) =>
        this._utils.getAllDebugElements(`${gridSelector} .ui-grid-header-cell`, debugEl)
            .filter(el => this._utils.getDebugElement('.ui-grid-header-title', el))
            .map(el => el.attributes['data-property']);

    getHeaderCell = (property: string, debugEl = this._utils.fixture.debugElement) =>
        this._utils.getDebugElement(`.ui-grid-header-cell[data-property="${property}"]`, debugEl);

    getHeaderTitle = (property: string, debugEl = this._utils.fixture.debugElement) =>
        this.getHeaderCell(property, debugEl).query(By.css('.ui-grid-header-title'));

    isSortable = (property: string, debugEl = this._utils.fixture.debugElement) => {
        const headerCell = this.getHeaderCell(property, debugEl);

        return !!headerCell.nativeElement.classList.contains('ui-grid-header-cell-sortable');
    };

    getRowItem = (
        rowNumber: number,
        selector: string,
        {
            gridSelector,
            debugEl,
        }: {
            gridSelector?: string;
            debugEl?: DebugElement;
        } = {}) => this._utils.getDebugElement(
            `${gridSelector ?? selectors.grid} [data-row-index="${rowNumber}"] ${selector}`,
            debugEl ?? this._utils.fixture.debugElement,
        );

    getMenuDictionary = (
        rowNumber: number,
        cfg: {
            gridSelector?: string;
            menu?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        const menuItems = this.getMenuItems(rowNumber, cfg);
        return menuItems.reduce((acc, step) => ({
            ...acc,
            [step.text]: step,
        }), {} as Record<string, { text: string; href: string | undefined }>);
    };

    getMenuItems = (
        rowNumber: number,
        {
            gridSelector,
            menu,
            debugEl,
        }: {
            gridSelector?: string;
            menu?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        gridSelector = gridSelector ?? selectors.grid;
        menu = menu ?? selectors.inlineMenu;

        this._utils.click(`${gridSelector} [data-row-index="${rowNumber}"] ${menu}`, debugEl);
        this._utils.fixture.detectChanges();
        const nodes = this._utils.getAllDebugElements('.cdk-overlay-container .mat-mdc-menu-item', debugEl);

        return nodes.map(item => ({
            text: item.query(By.css('span')).nativeElement.innerText,
            href: (item.nativeElement as HTMLAnchorElement).href as string | undefined,
            node: item.nativeElement,
        }));
    };

    clickMenuItem = (
        rowIndex: number,
        actionSelector: string,
        {
            gridSelector,
            inlineMenuSelector,
            debugEl,
        }: {
            gridSelector?: string;
            inlineMenuSelector?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        inlineMenuSelector = inlineMenuSelector ?? selectors.inlineMenu;

        this.clickRowItem(rowIndex, inlineMenuSelector, {
            gridSelector,
            debugEl,
        });
        this._utils.fixture.detectChanges();

        this._utils.click(actionSelector, debugEl);
        this._utils.fixture.detectChanges();
    };

    clickRowItem = (
        rowNumber: number,
        selector: string,
        {
            gridSelector,
            debugEl,
        }: {
            gridSelector?: string;
            debugEl?: DebugElement;
        } = {}) => this.getRowItem(rowNumber, selector, {
            debugEl,
            gridSelector,
        }).nativeElement
            .dispatchEvent(EventGenerator.click);

    getRowCheckbox = (rowNumber: number, gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        const rowEl = this._utils.getDebugElement(`${gridSelector} [data-row-index="${rowNumber - 1}"]`, debugEl);

        const rowCheckbox = this._utils.getDebugElement('mat-checkbox input', rowEl);

        return rowCheckbox;
    };

    checkRow = (rowNumber: number, gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        this.getRowCheckbox(rowNumber, gridSelector, debugEl).nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
    };

    openContextMenu = (rowNumber: number) => {
        const selector = `${`[data-row-index="${rowNumber - 1}"]`} ${'[data-cy="grid-action-menu"]'}`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));
        button.nativeElement.dispatchEvent(EventGenerator.click);
    };

    openSearchFilter = ({
        columnName,
    }: {
        columnName: string;
    }) => {
        const selector = `[data-cy="ui-grid-search-filter-${columnName}"] [role="combobox"]`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));

        button.nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
        tick(300);
    };

    filterData = ({
        columnName,
        nth,
        overlayContainerElement,
    }: {
        columnName: string;
        nth: number;
        overlayContainerElement: HTMLElement;
    }) => {
        const selector = `[data-column-name="ui-grid-dropdown-filter-${columnName}"]`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));
        button.nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();

        const labelButton = overlayContainerElement.querySelectorAll('button.mat-mdc-menu-item');
        labelButton[nth].dispatchEvent(EventGenerator.click);

        this._utils.fixture.detectChanges();
        tick(500);
        this._utils.fixture.detectChanges();
    };
}
