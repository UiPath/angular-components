import * as faker from 'faker';
import {
    a11y,
    axe,
} from 'projects/angular/axe-helper';
import {
    animationFrameScheduler,
    firstValueFrom,
    Observable,
    of,
} from 'rxjs';
import {
    finalize,
    skip,
    take,
} from 'rxjs/operators';

import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    flush,
    TestBed,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatMenuItem } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IFilterModel,
    ResizeStrategy,
} from '@uipath/angular/components/ui-grid';
import {
    ISuggestValues,
    UiSuggestComponent,
} from '@uipath/angular/components/ui-suggest';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

import { UiMatPaginatorIntl } from './components/ui-grid-custom-paginator/ui-grid-custom-paginator.component';
import { UiGridCustomPaginatorModule } from './components/ui-grid-custom-paginator/ui-grid-custom-paginator.module';
import { IDropdownOption } from './filters/ui-grid-dropdown-filter.directive';
import {
    generateEntity,
    generateListFactory,
    ITestEntity,
} from './test';
import {
    UiGridComponent,
    UI_GRID_OPTIONS,
} from './ui-grid.component';
import { UiGridIntl } from './ui-grid.intl';
import { UiGridModule } from './ui-grid.module';

describe('Component: UiGrid', () => {
    const GRID_COLUMN_CHANGE_DELAY = 10;

    @Component({
        template: `
            <ui-grid [data]="data"
                     [disableSelectionByEntry]="disableSelectionByEntry"
                     [refreshable]="refreshable"
                     [selectable]="selectable"
                     [showHeaderRow]="showHeaderRow"
                     [virtualScroll]="virtualScroll">
                <ui-grid-column [property]="'myNumber'"
                                title="Number Header"
                                width="25%">
                </ui-grid-column>

                <ui-grid-column [property]="'myBool'"
                                title="Boolean Header"
                                width="25%">
                </ui-grid-column>

                <ui-grid-column *ngIf="isColumnVisible"
                                [property]="'myObj.myObjString'"
                                title="Nested String Header"
                                width="25%">
                        <ui-grid-dropdown-filter [visible]="isFilterVisible"
                                                 [items]="someFilter"
                                                 [showAllOption]="true"
                                                 method="ge">
                        </ui-grid-dropdown-filter>
                </ui-grid-column>

                <ui-grid-column [property]="'myObj.myObjDate'"
                                title="Nested Date Header"
                                width="25%">
                </ui-grid-column>
            </ui-grid>
        `,
    })
    class TestFixtureSimpleGridComponent {
        @ViewChild(UiGridComponent, {
            static: true,
        })
        grid!: UiGridComponent<ITestEntity>;

        data: ITestEntity[] = [];
        someFilter = [];
        isColumnVisible = true;
        isFilterVisible = true;
        selectable?: boolean;
        refreshable?: boolean;
        showHeaderRow = true;
        virtualScroll = false;
        disableSelectionByEntry: (entry?: ITestEntity) => null | string = () => null;
    }
    describe('Scenario: simple grid', () => {
        let fixture: ComponentFixture<TestFixtureSimpleGridComponent>;
        let component: TestFixtureSimpleGridComponent;
        let grid: UiGridComponent<ITestEntity>;
        const intl = new UiGridIntl();

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    NoopAnimationsModule,
                ],
                declarations: [TestFixtureSimpleGridComponent],
            });

            fixture = TestBed.createComponent(TestFixtureSimpleGridComponent);
            fixture.componentInstance.virtualScroll = false;

            fixture.detectChanges();

            component = fixture.componentInstance;
            grid = component.grid;
        });

        afterEach(() => {
            fixture.destroy();
        });

        describe('Configuration: grid with columns and rows', () => {
            beforeEach(() => {
                component.refreshable = false;
                component.selectable = false;

                fixture.detectChanges();
            });

            describe('State: initial', () => {
                it('should render 4 column headers', () => {
                    const headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(4);
                });

                it('should render header title correctly', () => {
                    const [
                        numberHeader,
                        boolHeader,
                        nestedStringHeader,
                        nestedDateHeader,
                    ] = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                    expect(numberHeader.nativeElement.innerText).toContain('Number Header'.toUpperCase());
                    expect(boolHeader.nativeElement.innerText).toContain('Boolean Header'.toUpperCase());
                    expect(nestedStringHeader.nativeElement.innerText).toContain('Nested String Header'.toUpperCase());
                    expect(nestedDateHeader.nativeElement.innerText).toContain('Nested Date Header'.toUpperCase());
                });

                it('should render one row that displays no data', () => {
                    const noDataRow = fixture.debugElement.query(By.css('.ui-grid-no-data-container'));

                    expect(noDataRow.nativeElement).toBeDefined();
                    expect(noDataRow.nativeElement.innerText).toContain(intl.noDataMessage);
                });

                it('should NOT render checkbox and refresh cells', () => {
                    const headerCells = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell.ui-grid-feature-cell'));

                    expect(headerCells.length).toEqual(0);
                });

                it(`should hide the column and its filter when the column 'visible' input is set to false`, () => {
                    let headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));
                    const getDropdownFilter = () => fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(4);
                    expect(getDropdownFilter()).toBeTruthy();

                    fixture.componentInstance.isColumnVisible = false;
                    fixture.detectChanges();

                    headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));
                    expect(headers.length).toEqual(3);
                    expect(getDropdownFilter()).toBeFalsy();
                });

                it(`should hide the filter when the 'visible' input is set to false`, fakeAsync(() => {
                    let headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));
                    const getDropdownFilter = () => fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(4);
                    fixture.detectChanges();
                    expect(getDropdownFilter()).toBeTruthy();

                    fixture.componentInstance.isFilterVisible = false;
                    fixture.detectChanges();

                    headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));
                    expect(headers.length).toEqual(4);
                    expect(getDropdownFilter()).toBeFalsy();
                }));

                it('should emit event on resizeEnd', fakeAsync(() => {
                    let resizeEmissions = 0;
                    grid.resizeEnd.pipe(
                        take(1),
                    ).subscribe(() => resizeEmissions++);
                    grid.resizeManager.stop();
                    tick();

                    grid.resizeStrategy = ResizeStrategy.AggresiveNeighbourPush;
                    grid.resizeEnd.pipe(
                        take(1),
                    ).subscribe(() => resizeEmissions++);
                    grid.resizeManager.stop();
                    tick();

                    expect(resizeEmissions).toBe(2);
                }));

                it('should resize column on key press', fakeAsync(() => {
                    const col = document.querySelector('div[role="columnheader"]')!;
                    const initialWidth = col!.getBoundingClientRect()!.width;
                    col.dispatchEvent(EventGenerator.keyDown(Key.ArrowRight));
                    fixture.detectChanges();
                    tick(50);
                    col.dispatchEvent(EventGenerator.keyUp(Key.ArrowRight));

                    const newWidth = col!.getBoundingClientRect()!.width;
                    expect(newWidth).toBeGreaterThan(initialWidth);

                    discardPeriodicTasks();
                }));

                it('should not resize last grid column on key press', fakeAsync(() => {
                    const columns = document.querySelectorAll('div[role="columnheader"]')!;
                    const lastColumn = columns[columns.length - 1];
                    const initialWidth = lastColumn!.getBoundingClientRect()!.width;
                    lastColumn.dispatchEvent(EventGenerator.keyDown(Key.ArrowRight));
                    fixture.detectChanges();
                    tick(50);
                    lastColumn.dispatchEvent(EventGenerator.keyUp(Key.ArrowRight));

                    const newWidth = lastColumn!.getBoundingClientRect()!.width;
                    expect(newWidth).toEqual(initialWidth);

                    discardPeriodicTasks();
                }));

                it('should keep the same total width for 2 neighbored columns after resizing one', fakeAsync(() => {
                    const col1 = document.querySelectorAll('div[role="columnheader"]')![0];
                    const col2 = document.querySelectorAll('div[role="columnheader"]')![1];

                    const initialCol1Width = col1!.getBoundingClientRect()!.width;
                    const initialCol2Width = col2!.getBoundingClientRect()!.width;

                    col1.dispatchEvent(EventGenerator.keyDown(Key.ArrowRight));
                    fixture.detectChanges();
                    tick(50);
                    col1.dispatchEvent(EventGenerator.keyUp(Key.ArrowRight));

                    const newCol1Width = col1!.getBoundingClientRect()!.width;
                    const newCol2Width = col2!.getBoundingClientRect()!.width;
                    expect(newCol1Width).toBeGreaterThan(newCol2Width);
                    expect(Math.round(initialCol1Width + initialCol2Width)).toEqual(Math.round(newCol1Width + newCol2Width));
                    discardPeriodicTasks();
                }));
            });

            describe('State: populated', () => {
                let data: ITestEntity[];

                beforeEach(() => {
                    data = generateListFactory(generateEntity)(50);

                    component.data = data;
                    fixture.detectChanges();
                });

                it('should correctly set the data internally', () => {
                    expect(grid.dataManager.length).toEqual(data.length);
                    expect(grid.dataManager.data$.getValue()).toEqual(data);
                });

                it('should render all the rows associated to the data array', () => {
                    const rows = fixture.debugElement.queryAll(By.css('.ui-grid-row'));

                    expect(rows.length).toEqual(data.length);
                });

                it('should render the correct cell text for each column', () => {
                    fixture.detectChanges();
                    const rows = fixture.debugElement.queryAll(By.css('.ui-grid-row'));

                    rows.forEach((row, index) => {
                        const dataEntry = data[index];

                        const [
                            numberCell,
                            boolCell,
                            nestedStringCell,
                            nestedDateCell,
                        ] = row.queryAll(By.css('.ui-grid-cell'));

                        expect(numberCell.nativeElement.innerText).toContain(dataEntry.myNumber);
                        expect(boolCell.nativeElement.innerText).toContain(dataEntry.myBool.toString());
                        expect(nestedStringCell.nativeElement.innerText).toContain(dataEntry.myObj.myObjString);
                        expect(nestedDateCell.nativeElement.innerText).toContain(dataEntry.myObj.myObjDate.toString());
                    });
                });

                it('should mark first column cells as row headers when no primary column is set', () => {
                    fixture.detectChanges();
                    const firstRow = fixture.debugElement.query(By.css('.ui-grid-row'));
                    const [firstCell, secondCell, thirdCell] = firstRow.queryAll(By.css('.ui-grid-cell'));
                    expect(firstCell.nativeElement.getAttribute('role')).toBe('rowheader');
                    expect(secondCell.nativeElement.getAttribute('role')).toBe('gridcell');
                    expect(thirdCell.nativeElement.getAttribute('role')).toBe('gridcell');
                });

                it('should mark only one column cell as row header when there are multiple primary columns', fakeAsync(() => {
                    grid.columns.forEach((col, idx) => col.primary = idx > 0);
                    fixture.detectChanges();
                    tick(GRID_COLUMN_CHANGE_DELAY);
                    fixture.detectChanges();
                    const firstRow = fixture.debugElement.query(By.css('.ui-grid-row'));
                    const [firstCell, secondCell, thirdCell] = firstRow.queryAll(By.css('.ui-grid-cell'));
                    expect(firstCell.nativeElement.getAttribute('role')).toBe('gridcell');
                    expect(secondCell.nativeElement.getAttribute('role')).toBe('rowheader');
                    expect(thirdCell.nativeElement.getAttribute('role')).toBe('gridcell');
                }));
            });
        });

        describe('Configuration: grid with columns, rows, refresh and checkboxes', () => {
            beforeEach(() => {
                component.refreshable = true;
                component.selectable = true;

                fixture.detectChanges();
            });

            describe('State: initial', () => {
                it('should render 4 column headers', () => {
                    const headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell:not(.ui-grid-feature-cell)'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(4);
                });

                it('should render header title correctly', () => {
                    const [
                        numberHeader,
                        boolHeader,
                        nestedStringHeader,
                        nestedDateHeader,
                    ] = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell:not(.ui-grid-feature-cell)'));

                    expect(numberHeader.nativeElement.innerText).toContain('Number Header'.toUpperCase());
                    expect(boolHeader.nativeElement.innerText).toContain('Boolean Header'.toUpperCase());
                    expect(nestedStringHeader.nativeElement.innerText).toContain('Nested String Header'.toUpperCase());
                    expect(nestedDateHeader.nativeElement.innerText).toContain('Nested Date Header'.toUpperCase());
                });

                it('should render one row that displays no data', () => {
                    const noDataRow = fixture.debugElement.query(By.css('.ui-grid-no-data-container'));

                    expect(noDataRow.nativeElement).toBeDefined();
                    expect(noDataRow.nativeElement.innerText).toContain(intl.noDataMessage);
                });

                it('should render checkbox and refresh cells', () => {
                    const [checkbox, refresh] = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell.ui-grid-feature-cell'));

                    expect(checkbox).toBeDefined();
                    expect(refresh).toBeDefined();

                    const matCheckbox = checkbox.query(By.css('.mat-checkbox'));
                    expect(matCheckbox).toBeDefined();
                    expect(matCheckbox.nativeElement).toBeDefined();

                    const refreshBtn = refresh.query(By.css('.grid-refresh-button'));
                    expect(refreshBtn).toBeDefined();
                    expect(refreshBtn.nativeElement).toBeDefined();
                    expect(refreshBtn.nativeElement).toHaveAttr('aria-label', intl.refreshTooltip);
                });
            });

            describe('State: populated', () => {
                let data: ITestEntity[];

                beforeEach(() => {
                    data = generateListFactory(generateEntity)(50);

                    component.data = data;
                    fixture.detectChanges();
                });

                it('should correctly set the data internally', () => {
                    expect(grid.dataManager.length).toEqual(data.length);
                    expect(grid.dataManager.data$.getValue()).toEqual(data);
                });

                it('should render all the rows associated to the data array', () => {
                    const rows = fixture.debugElement.queryAll(By.css('.ui-grid-row'));

                    expect(rows.length).toEqual(data.length);
                });

                it('should render the correct cell text for each column', () => {
                    const rows = fixture.debugElement.queryAll(By.css('.ui-grid-row'));

                    rows.forEach((row, index) => {
                        const dataEntry = data[index];

                        const [
                            numberCell,
                            boolCell,
                            nestedStringCell,
                            nestedDateCell,
                        ] = row.queryAll(By.css('.ui-grid-cell:not(.ui-grid-feature-cell)'));

                        expect(numberCell.nativeElement.innerText).toContain(dataEntry.myNumber);
                        expect(boolCell.nativeElement.innerText).toContain(dataEntry.myBool.toString());
                        expect(nestedStringCell.nativeElement.innerText).toContain(dataEntry.myObj.myObjString);
                        expect(nestedDateCell.nativeElement.innerText).toContain(dataEntry.myObj.myObjDate.toString());
                    });
                });

                describe('Feature: checkbox', () => {
                    it('should have ariaLabel set correctly for toggle selection', () => {
                        const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));
                        const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;

                        expect(matCheckbox.checked).toEqual(false);
                        expect(matCheckbox.ariaLabel).toEqual('Select all');

                        const checkboxInput = checkboxHeader.query(By.css('input'));
                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        expect(matCheckbox.checked).toEqual(true);
                        expect(matCheckbox.ariaLabel).toEqual('Deselect all');
                    });

                    it('should check all rows if the header checkbox is clicked', () => {
                        const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));
                        const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;

                        expect(matCheckbox.checked).toEqual(false);

                        const checkboxInput = checkboxHeader.query(By.css('input'));
                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        expect(matCheckbox.checked).toEqual(true);

                        const rowCheckboxList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell mat-checkbox'))
                            .map(el => el.componentInstance as MatCheckbox);

                        expect(rowCheckboxList.length).toEqual(data.length);

                        rowCheckboxList.forEach(checkbox => expect(checkbox.checked).toEqual(true));

                        expect(grid.selectionManager.selected.length).toEqual(data.length);
                        expect(grid.selectionManager.selected).toEqual(data);
                        expect(grid.isEveryVisibleRowChecked).toEqual(true);
                    });

                    it('should check and uncheck all rows if the header checkbox is clicked twice', () => {
                        const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));

                        const checkboxInput = checkboxHeader.query(By.css('input'));
                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;

                        expect(matCheckbox.checked).toEqual(true);

                        const rowCheckboxList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell mat-checkbox'))
                            .map(el => el.componentInstance as MatCheckbox);

                        expect(rowCheckboxList.length).toEqual(data.length);

                        rowCheckboxList.forEach((checkbox, i) => {
                            expect(checkbox.checked).toEqual(true);
                            expect(checkbox.ariaLabel).toEqual(`Deselect row ${i}`);
                        });

                        expect(grid.selectionManager.selected.length).toEqual(data.length);
                        expect(grid.selectionManager.selected).toEqual(data);
                        expect(grid.isEveryVisibleRowChecked).toEqual(true);

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        expect(matCheckbox.checked).toEqual(false);
                        rowCheckboxList.forEach((checkbox, i) => {
                            expect(checkbox.checked).toEqual(false);
                            expect(checkbox.ariaLabel).toEqual(`Select row ${i}`);
                        });
                        expect(grid.hasValueOnVisiblePage).toEqual(false);
                    });

                    it('should mark the header checkbox as indeterminate if not all rows are selected', () => {
                        const rowCheckboxInputList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                        faker.helpers
                            .shuffle(rowCheckboxInputList)
                            .filter((_, idx) => idx % 2)
                            .forEach((checkboxInput, idx) => {
                                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);
                                fixture.detectChanges();
                                expect(grid.selectionManager.selected.length).toEqual(idx + 1);
                            });

                        const matCheckbox = fixture.debugElement
                            .query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell mat-checkbox'))
                            .componentInstance as MatCheckbox;

                        expect(matCheckbox.indeterminate).toEqual(true);
                    });

                    it('should mark the header checkbox as indeterminate one row is unchecked', () => {
                        grid.selectionManager.select(...data);
                        fixture.detectChanges();

                        const matCheckbox = fixture.debugElement
                            .query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell mat-checkbox'))
                            .componentInstance as MatCheckbox;

                        expect(matCheckbox.indeterminate).toEqual(false);
                        expect(matCheckbox.checked).toEqual(true);

                        const rowCheckboxInputList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                        const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        expect(matCheckbox.indeterminate).toEqual(true);
                        expect(matCheckbox.checked).toEqual(false);
                    });

                    it('should mark the header checkbox as indeterminate one row is checked', () => {
                        const matCheckbox = fixture.debugElement
                            .query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell mat-checkbox'))
                            .componentInstance as MatCheckbox;

                        expect(matCheckbox.indeterminate).toEqual(false);
                        expect(matCheckbox.checked).toEqual(false);

                        const rowCheckboxInputList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                        const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        expect(matCheckbox.indeterminate).toEqual(true);
                        expect(matCheckbox.checked).toEqual(false);
                    });

                    it('should select all rows from 0 to the clicked one if shift is pressed', () => {
                        const rowCheckboxInputList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                        const event = document.createEvent('MouseEvent');
                        event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);

                        fixture.componentInstance.grid.checkShift(event);

                        rowCheckboxInputList[10].nativeElement.dispatchEvent(EventGenerator.click);

                        for (let i = 0; i <= 10; i++) {
                            expect(grid.selectionManager.isSelected(data[i])).toBeTrue();
                        }
                    });

                    describe('Scenario: shift pressed after a row is selected by click without shift', () => {
                        beforeEach(() => {
                            const rowCheckboxInputList = fixture.debugElement
                                .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                            rowCheckboxInputList[5].nativeElement.dispatchEvent(EventGenerator.click);

                            const event = document.createEvent('MouseEvent');
                            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null);

                            fixture.componentInstance.grid.checkShift(event);
                        });

                        it('should select rows between last clicked and current clicked when shift key is pressed', () => {
                            const rowCheckboxInputList = fixture.debugElement
                                .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                            rowCheckboxInputList[10].nativeElement.dispatchEvent(EventGenerator.click);

                            fixture.detectChanges();

                            for (let i = 5; i <= 10; i++) {
                                expect(grid.selectionManager.isSelected(data[i])).toBeTrue();
                            }
                        });

                        it('should not unselect row if clicked twice while shift pressed', () => {
                            const rowCheckboxInputList = fixture.debugElement
                                .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                            rowCheckboxInputList[5].nativeElement.dispatchEvent(EventGenerator.click);

                            fixture.detectChanges();

                            expect(grid.selectionManager.isSelected(data[5])).toBeTrue();
                        });

                        it('should correctly deselect and select on range change while shift pressed', () => {
                            const rowCheckboxInputList = fixture.debugElement
                                .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                            rowCheckboxInputList[10].nativeElement.dispatchEvent(EventGenerator.click);
                            fixture.detectChanges();

                            for (let i = 5; i <= 10; i++) {
                                expect(grid.selectionManager.isSelected(data[i])).toBeTrue();
                            }

                            rowCheckboxInputList[2].nativeElement.dispatchEvent(EventGenerator.click);
                            fixture.detectChanges();

                            for (let i = 2; i <= 5; i++) {
                                expect(grid.selectionManager.isSelected(data[i])).toBeTrue();
                            }
                            for (let i = 6; i <= 10; i++) {
                                expect(grid.selectionManager.isSelected(data[i])).toBeFalse();
                            }
                        });
                    });

                    it('should NOT show multi page select info message if multiPageSelect is false and selection is made', () => {
                        grid.multiPageSelect = false;
                        const rowCheckboxInputList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                        const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        const infoMessage = fixture.debugElement
                            .query(By.css('.ui-grid-selection-info-message'));

                        expect(infoMessage).toBeNull();
                    });

                    it('should show multi page select info message with count if multiPageSelect is true and selection is made', () => {
                        grid.multiPageSelect = true;
                        const rowCheckboxInputList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                        const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        const infoMessage = fixture.debugElement
                            .query(By.css('.ui-grid-selection-info-message'));

                        expect(infoMessage.nativeElement.innerText).toEqual(intl.translateMultiPageSelectionCount(1));
                    });

                    it('should disable selection for rows that do not pass the disableSelectionByEntry function if it is set', () => {
                        const unselectableReason = 'unselectable';
                        const disableSelectionByEntry = () => unselectableReason;

                        component.disableSelectionByEntry = disableSelectionByEntry;
                        grid.selectionManager.disableSelectionByEntry = disableSelectionByEntry;
                        fixture.detectChanges();

                        const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));
                        const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;

                        expect(matCheckbox.checked).toEqual(false);

                        const checkboxInput = checkboxHeader.query(By.css('input'));
                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        const rowCheckboxList = fixture.debugElement
                            .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell mat-checkbox'))
                            .map(el => el.componentInstance as MatCheckbox);

                        expect(rowCheckboxList.length).toEqual(50);

                        rowCheckboxList.forEach(checkbox => {
                            expect(checkbox.checked).toEqual(false);
                            expect(checkbox.disabled).toEqual(true);
                            expect(checkbox._elementRef.nativeElement.querySelector('input')).toHaveAttr('aria-label', unselectableReason);
                        });

                        expect(grid.selectionManager.selected.length).toEqual(0);
                        expect(grid.isEveryVisibleRowChecked).toEqual(false);
                    });

                    it('should unselect header checkbox if data changes', () => {
                        const disableSelectionByEntry = (entry?: ITestEntity) => entry && entry.id % 2 === 1 ? 'unselectable' : null;

                        component.disableSelectionByEntry = disableSelectionByEntry;
                        grid.selectionManager.disableSelectionByEntry = disableSelectionByEntry;
                        fixture.detectChanges();

                        const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));
                        const checkboxInput = checkboxHeader.query(By.css('input'));

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        const newData = generateListFactory(generateEntity)(50);
                        component.data = newData;

                        fixture.detectChanges();

                        const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;
                        expect(matCheckbox.checked).toEqual(false);
                    });

                    it('should unselect heade checkbox if all grid rows are unselected', () => {
                        const disableSelectionByEntry = (entry?: ITestEntity) => entry && entry.id % 2 === 1 ? 'unselectable' : null;

                        component.disableSelectionByEntry = disableSelectionByEntry;
                        grid.selectionManager.disableSelectionByEntry = disableSelectionByEntry;
                        fixture.detectChanges();

                        const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));
                        const checkboxInput = checkboxHeader.query(By.css('input'));

                        checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        fixture.debugElement.queryAll(By.css('[role="gridcell"] input[type="checkbox"]:not([disabled])'))
                            .map(checkboxDebugElement => checkboxDebugElement.nativeElement)
                            .forEach(checkboxNativeElement => checkboxNativeElement.dispatchEvent(EventGenerator.click));

                        const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;
                        expect(matCheckbox.checked).toEqual(false);
                    });

                    it('should show indeterminate header checkbox if selected after a row is selected and grid has disabled rows',
                        fakeAsync(() => {
                            const disableSelectionByEntry = (entry?: ITestEntity) => entry && entry.id % 2 === 1 ? 'unselectable' : null;

                            component.disableSelectionByEntry = disableSelectionByEntry;
                            grid.selectionManager.disableSelectionByEntry = disableSelectionByEntry;
                            fixture.detectChanges();

                            fixture.debugElement.query(By.css('[role="gridcell"] input[type="checkbox"]:not([disabled])'))
                                .nativeElement.dispatchEvent(EventGenerator.click);

                            fixture.detectChanges();

                            const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));
                            const checkboxInput = checkboxHeader.query(By.css('input'));

                            checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                            fixture.detectChanges();
                            tick();
                            fixture.detectChanges();

                            const matCheckbox = checkboxHeader.query(By.css('mat-checkbox')).componentInstance as MatCheckbox;
                            expect(matCheckbox.indeterminate).toBeTrue();
                        }));
                });
            });
        });

        describe('Configuration: grid without header row', () => {
            beforeEach(() => {
                component.showHeaderRow = false;

                fixture.detectChanges();
            });

            describe('State: initial', () => {
                it('should not render any header', () => {
                    const headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(0);
                });
            });

            describe('State: populated', () => {
                let data: ITestEntity[];

                beforeEach(() => {
                    data = generateListFactory(generateEntity)(50);

                    component.data = data;
                    fixture.detectChanges();
                });

                it('should correctly set the data internally', () => {
                    expect(grid.dataManager.length).toEqual(data.length);
                    expect(grid.dataManager.data$.getValue()).toEqual(data);
                });

                it('should render all the rows associated to the data array', () => {
                    const rows = fixture.debugElement.queryAll(By.css('.ui-grid-row'));

                    expect(rows.length).toEqual(data.length);
                });

                it('should render the correct cell text for each column', () => {
                    fixture.detectChanges();
                    const rows = fixture.debugElement.queryAll(By.css('.ui-grid-row'));

                    rows.forEach((row, index) => {
                        const dataEntry = data[index];

                        const [
                            numberCell,
                            boolCell,
                            nestedStringCell,
                            nestedDateCell,
                        ] = row.queryAll(By.css('.ui-grid-cell'));

                        expect(numberCell.nativeElement.innerText).toContain(dataEntry.myNumber);
                        expect(boolCell.nativeElement.innerText).toContain(dataEntry.myBool.toString());
                        expect(nestedStringCell.nativeElement.innerText).toContain(dataEntry.myObj.myObjString);
                        expect(nestedDateCell.nativeElement.innerText).toContain(dataEntry.myObj.myObjDate.toString());
                    });
                });
            });
        });

        describe('Configuration: using virtual scroll', () => {
            beforeEach(() => {
                component.virtualScroll = true;
                fixture.detectChanges();
            });

            const virtualScrollViewportSelector = By.css('.ui-grid-viewport');
            const compensationCellSelector = By.css('.ui-grid-scroll-size-compensation-cell');

            function finishInit(componentFixture: ComponentFixture<any>) {
                // On the first cycle we render and measure the viewport.
                componentFixture.detectChanges();
                flush();

                // On the second cycle we render the items.
                componentFixture.detectChanges();
                flush();

                // Flush the initial fake scroll event.
                animationFrameScheduler.flush();
                flush();
                componentFixture.detectChanges();

                // Flush the scrollbar width compensation calculation
                tick();
                componentFixture.detectChanges();
            }

            it('should NOT add a scrollbar spacer when scrollbar is not present', fakeAsync(() => {
                component.data = generateListFactory(generateEntity)(1);
                finishInit(fixture);

                const compensationWidthPx = fixture.debugElement.query(compensationCellSelector).nativeElement.style.marginLeft;

                expect(parseInt(compensationWidthPx, 10)).toBe(0);
            }));

            it('should add a scrollbar spacer equal to the scrollbar width', fakeAsync(() => {
                component.data = generateListFactory(generateEntity)(50);
                fixture.detectChanges();

                finishInit(fixture);

                const compensationWidthPx = fixture.debugElement.query(compensationCellSelector).nativeElement.style.marginLeft;
                const virtualScrollViewport = fixture.debugElement.query(virtualScrollViewportSelector).nativeElement;

                expect(parseInt(compensationWidthPx, 10)).toBe(virtualScrollViewport.offsetWidth - virtualScrollViewport.clientWidth);
            }));
        });
    });

    @Component({
        template: `
            <ui-grid [data]="data">
                <ui-grid-header [search]="search">
                    <ui-header-button type="main">
                        <ng-template>
                            <button class="main-action-button">Main Action</button>
                        </ng-template>
                    </ui-header-button>
                    <ui-header-button type="inline">
                        <ng-template>
                            <button class="inline-action-button">Inline Action</button>
                        </ng-template>
                    </ui-header-button>
                    <ui-header-button type="action">
                        <ng-template>
                            <button class="selection-action-button">Selection Action</button>
                        </ng-template>
                    </ui-header-button>
                </ui-grid-header>
                <ui-grid-column [property]="'myNumber'"
                                [searchable]="true"
                                title="Number Header"
                                width="100%">
                </ui-grid-column>
            </ui-grid>
        `,
    })
    class TestFixtureGridHeaderActionsComponent {
        @ViewChild(UiGridComponent, {
            static: true,
        })
        grid!: UiGridComponent<ITestEntity>;

        data: ITestEntity[] = [];
        search?: boolean;
    }

    describe('Scenario: grid with header actions', () => {
        let fixture: ComponentFixture<TestFixtureGridHeaderActionsComponent>;
        let component: TestFixtureGridHeaderActionsComponent;
        let grid: UiGridComponent<ITestEntity>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    NoopAnimationsModule,
                ],
                declarations: [TestFixtureGridHeaderActionsComponent],
            });

            fixture = TestBed.createComponent(TestFixtureGridHeaderActionsComponent);

            fixture.detectChanges();

            component = fixture.componentInstance;
            grid = component.grid;
            grid.data = generateListFactory(generateEntity)();
        });

        afterEach(() => {
            fixture.destroy();
        });

        describe('Configuration: without search', () => {
            beforeEach(() => {
                component.search = false;
                fixture.detectChanges();
            });

            a11y.suite((runOptions) => {
                a11y.it('should have no violations', async () => {
                    expect(await axe(fixture.nativeElement, runOptions)).toHaveNoViolations();
                });
            });

            it('should display the main header action button', () => {
                const mainHeaderAction = fixture.debugElement.query(By.css('.main-action-button'));

                expect(mainHeaderAction).toBeDefined();
                expect(mainHeaderAction.nativeElement).toBeDefined();
                expect(mainHeaderAction.nativeElement.innerText).toEqual('Main Action');
            });

            it('should display an inline header button', () => {
                const inlineHeaderAction = fixture.debugElement.query(By.css('.inline-action-button'));

                expect(inlineHeaderAction).toBeDefined();
                expect(inlineHeaderAction.nativeElement).toBeDefined();
                expect(inlineHeaderAction.nativeElement.innerText).toEqual('Inline Action');
            });

            it('should NOT display the selection action button if no row is selected', () => {
                const headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));

                expect(headerSelectionAction).toBeFalsy();
            });

            it('should display the selection action button if at least one row is selected', () => {
                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                const headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));
                expect(headerSelectionAction).toBeDefined();
                expect(headerSelectionAction.nativeElement).toBeDefined();
                expect(headerSelectionAction.nativeElement.innerText).toEqual('Selection Action');
            });

            it('should reset grid header actions when grid data changes', fakeAsync(() => {
                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                let headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));
                expect(headerSelectionAction).toBeDefined();
                expect((grid.selectionManager as any)._hasValue$.getValue()).toBe(true);

                component.data = generateListFactory(generateEntity)();
                fixture.detectChanges();

                headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));

                expect(headerSelectionAction).toBeFalsy();
                expect((grid.selectionManager as any)._hasValue$.getValue()).toBe(false);
            }));

            it('should be able to move focus to selection action button if at least one row is selected', () => {
                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                const headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));
                expect(headerSelectionAction).toBeDefined();

                const gridContainer = fixture.debugElement.query(By.css('.ui-grid-container'));
                gridContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowUp, Key.Shift, Key.Alt),
                );
                fixture.detectChanges();
                expect(document.activeElement).toEqual(headerSelectionAction.nativeElement);
            });

            it('should live announce the header actions when there is a selection in the grid', () => {
                const intl = new UiGridIntl();
                spyOn<any>((component.grid as any)._queuedAnnouncer, 'enqueue');

                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                expect((component.grid as any)._queuedAnnouncer.enqueue).toHaveBeenCalledTimes(1);
                expect((component.grid as any)._queuedAnnouncer.enqueue).toHaveBeenCalledWith(intl.gridHeaderActionsNotice);
            });

            it('should live announce the header actions only once if there are multiple items selected and deselected', () => {
                spyOn<any>((component.grid as any)._queuedAnnouncer, 'enqueue');

                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                rowCheckboxInputList.forEach(row => row.nativeElement.dispatchEvent(EventGenerator.click));

                fixture.detectChanges();

                rowCheckboxInputList.forEach(row => row.nativeElement.dispatchEvent(EventGenerator.click));

                expect((component.grid as any)._queuedAnnouncer.enqueue).toHaveBeenCalledTimes(1);
            });

            it('should NOT display the inline header button if at least one row is selected', () => {
                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                const inlineHeaderAction = fixture.debugElement.query(By.css('.inline-action-button'));
                expect(inlineHeaderAction).toBeFalsy();
            });
        });

        describe('Configuration: with search', () => {
            beforeEach(() => {
                component.search = true;
            });

            it('should limit the search input value to the configured max-length', () => {
                const max = 1337;
                component.grid.header!.searchMaxLength = max;
                fixture.detectChanges();

                const search = fixture.debugElement.query(By.css('ui-grid-search'));
                const input = search.query(By.css('input'));

                const maxLength = input.attributes.maxlength;

                expect(maxLength).toEqual(`${max}`);
            });

            it('should display the search input and NOT display the selection actions if no row is selected', () => {
                fixture.detectChanges();

                const headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));
                const gridSearch = fixture.debugElement.query(By.css('ui-grid-search'));

                expect(headerSelectionAction).toBeFalsy();
                expect(gridSearch).toBeDefined();
                expect(gridSearch.nativeElement).toBeDefined();
            });

            it('should NOT display the search input and display the selection actions if at least one row is selected', () => {
                fixture.detectChanges();

                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                const headerSelectionAction = fixture.debugElement.query(By.css('.selection-action-button'));
                const gridSearch = fixture.debugElement.query(By.css('ui-grid-search'));

                expect(gridSearch).toBeFalsy();
                expect(headerSelectionAction).toBeDefined();
                expect(headerSelectionAction.nativeElement).toBeDefined();
                expect(headerSelectionAction.nativeElement.innerText).toEqual('Selection Action');
            });
        });
    });

    @Component({
        template: `
            <ui-grid [data]="data">
                <ui-grid-header [search]="search">
                </ui-grid-header>
                <ui-grid-column [property]="'myNumber'"
                                [searchable]="true"
                                [sortable]="true"
                                title="Number Header"
                                width="50%">
                    <ui-grid-dropdown-filter [items]="dropdownItemList"
                                             [showAllOption]="showAllOption"></ui-grid-dropdown-filter>
                </ui-grid-column>
                <ui-grid-column [property]="'myString'"
                                [searchable]="true"
                                title="String Header"
                                width="50%">
                    <ui-grid-search-filter [searchSourceFactory]="searchFactory"></ui-grid-search-filter>
                </ui-grid-column>
            </ui-grid>
        `,
    })
    class TestFixtureGridHeaderWithFilterComponent {
        @ViewChild(UiGridComponent, {
            static: true,
        })
        grid!: UiGridComponent<ITestEntity>;

        data: ITestEntity[] = [];
        dropdownItemList: IDropdownOption[] = [];
        showAllOption?: boolean;
        search?: boolean;

        searchFactory = (): Observable<ISuggestValues<any>> => of({
            data: this.dropdownItemList
                .map(
                    option => ({
                        id: +option.value,
                        text: option.label,
                    }),
                ),
            total: this.dropdownItemList.length,
        });
    }

    describe('Scenario: grid with header, no header actions and column filters', () => {
        let fixture: ComponentFixture<TestFixtureGridHeaderWithFilterComponent>;
        let component: TestFixtureGridHeaderWithFilterComponent;
        let grid: UiGridComponent<ITestEntity>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    NoopAnimationsModule,
                ],
                declarations: [TestFixtureGridHeaderWithFilterComponent],
            });

            fixture = TestBed.createComponent(TestFixtureGridHeaderWithFilterComponent);
            component = fixture.componentInstance;
            grid = component.grid;
            grid.data = generateListFactory(generateEntity)();
        });

        afterEach(() => {
            fixture.destroy();
        });

        describe('Configuration: without search', () => {
            beforeEach(() => {
                component.search = false;
                fixture.detectChanges();
            });

            it('should display the column filter', () => {
                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter'));

                expect(filterContainer).toBeDefined();
                expect(filterContainer.nativeElement).toBeDefined();
                expect(searchFilter).toBeDefined();
                expect(searchFilter.nativeElement).toBeDefined();
            });

            it('should render the filter button', () => {
                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                expect(filterButton).toBeDefined();
                expect(filterButton.nativeElement).toBeDefined();
            });

            it('should render the filter button if a row is checked', () => {
                component.data = [generateEntity()];

                fixture.detectChanges();

                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter'));

                expect(filterContainer).toBeDefined();
                expect(filterContainer.nativeElement).toBeDefined();
                expect(searchFilter).toBeDefined();
                expect(searchFilter.nativeElement).toBeDefined();
            });
        });

        describe('Configuration: with search', () => {
            beforeEach(() => {
                component.search = true;
                fixture.detectChanges();
            });

            it('should render the search input next to the dropdown filter', () => {
                const search = fixture.debugElement.query(By.css('ui-grid-search'));
                const dropdownFilter = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));

                expect(search).toBeDefined();
                expect(search.nativeElement).toBeDefined();
                expect(search.nativeElement.nextElementSibling).toBe(dropdownFilter.nativeElement);
            });

            it('should render the dropdown filter next to the search filter', () => {
                const dropdownFilter = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter'));

                expect(dropdownFilter).toBeDefined();
                expect(dropdownFilter.nativeElement).toBeDefined();
                expect(dropdownFilter.nativeElement.nextElementSibling).toBe(searchFilter.nativeElement);
            });

            it('should render the filters if a row is checked', () => {
                component.data = [generateEntity()];

                fixture.detectChanges();

                const rowCheckboxInputList = fixture.debugElement
                    .queryAll(By.css('.ui-grid-row .ui-grid-cell.ui-grid-checkbox-cell input'));

                const checkboxInput = faker.helpers.randomize(rowCheckboxInputList);

                checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter'));

                expect(filterContainer).toBeDefined();
                expect(filterContainer.nativeElement).toBeDefined();
                expect(searchFilter).toBeDefined();
                expect(searchFilter.nativeElement).toBeDefined();
            });

            it('should display the column filters', () => {
                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter'));

                expect(filterContainer).toBeDefined();
                expect(filterContainer.nativeElement).toBeDefined();
                expect(searchFilter).toBeDefined();
                expect(searchFilter.nativeElement).toBeDefined();
            });

            it('should render the filter button', () => {
                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                expect(filterButton).toBeDefined();
                expect(filterButton.nativeElement).toBeDefined();
            });
        });

        describe('Filter: dropdown', () => {
            it(`should have only the 'All' option available`, () => {
                component.showAllOption = true;
                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const matMenuItems = filterContainer.queryAll(By.directive(MatMenuItem))
                    .map(item => item.componentInstance as MatMenuItem);

                expect(matMenuItems.length).toEqual(1);
                const [firstMenutItem] = matMenuItems;

                expect(firstMenutItem.getLabel()).toEqual('All');
            });

            it(`should display the 'All' option and the custom value list`, () => {
                component.showAllOption = true;
                fixture.detectChanges();

                const items = generateListFactory(() => ({
                    label: faker.random.word(),
                    value: faker.random.number(),
                }))();

                component.dropdownItemList = items;
                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const matMenuItems = filterContainer.queryAll(By.directive(MatMenuItem)).map(item => item.componentInstance as MatMenuItem);

                expect(matMenuItems.length).toEqual(items.length + 1);
                const [firstMenutItem, ...rest] = matMenuItems;

                expect(firstMenutItem.getLabel()).toEqual('All');
                rest.forEach((menuItem, idx) => expect(menuItem.getLabel()).toEqual(items[idx].label));
            });

            it(`should NOT have any filter options`, () => {
                component.showAllOption = false;
                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const matMenuItems = filterContainer.queryAll(By.directive(MatMenuItem)).map(item => item.componentInstance as MatMenuItem);

                expect(matMenuItems.length).toEqual(0);
            });

            it(`should display the custom value list`, () => {
                component.showAllOption = false;
                fixture.detectChanges();

                const items = generateListFactory(() => ({
                    label: faker.random.word(),
                    value: faker.random.number(),
                }))();

                component.dropdownItemList = items;
                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const matMenuItems = filterContainer.queryAll(By.directive(MatMenuItem)).map(item => item.componentInstance as MatMenuItem);

                expect(matMenuItems.length).toEqual(items.length);

                matMenuItems.forEach((menuItem, idx) => expect(menuItem.getLabel()).toEqual(items[idx].label));
            });
        });

        describe('Filter: search', () => {
            it(`should have the items in the custom value list`, waitForAsync(async () => {
                const items = generateListFactory(() => ({
                    label: faker.random.word(),
                    value: faker.random.number(),
                }))();

                component.dropdownItemList = items;
                fixture.detectChanges();

                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter')).componentInstance as UiSuggestComponent;

                searchFilter.open();
                fixture.detectChanges();

                await fixture.whenStable();

                expect(searchFilter.items.length).toEqual(items.length);
                searchFilter.items.forEach((item, idx) => expect(item.text).toEqual(items[idx].label));
            }));

            it(`should NOT have any filter options`, waitForAsync(async () => {
                fixture.detectChanges();

                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter')).componentInstance as UiSuggestComponent;

                searchFilter.open();
                fixture.detectChanges();

                await fixture.whenStable();

                expect(searchFilter.items.length).toEqual(0);
            }));
        });

        describe('Event: dropdown filter change', () => {
            beforeEach(() => {
                component.search = false;
                fixture.detectChanges();
            });

            it('should display the selected filter value', () => {
                const items = generateListFactory(() => ({
                    label: faker.random.word(),
                    value: faker.random.number(),
                }))();

                component.dropdownItemList = items;
                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const matMenuItems = filterContainer.queryAll(By.directive(MatMenuItem));

                const menuItem = faker.helpers.randomize(matMenuItems);

                menuItem.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const filterValue = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-value'));
                expect(filterValue.nativeElement.innerText.trim()).toEqual((menuItem.componentInstance as MatMenuItem).getLabel());
            });

            it('should trigger an event emission when the filter changes', (done) => {
                const items = generateListFactory(() => ({
                    label: faker.random.word(),
                    value: faker.random.number(),
                }))();

                component.dropdownItemList = items;
                fixture.detectChanges();

                const filterContainer = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-container'));
                const filterButton = filterContainer.query(By.css('.ui-grid-dropdown-filter-button'));

                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const matMenuItems = filterContainer.queryAll(By.directive(MatMenuItem));

                const menuItem = faker.helpers.randomize(matMenuItems);
                const menuItemLabel = (menuItem.componentInstance as MatMenuItem).getLabel();

                grid.filterManager.filter$
                    .pipe(
                        skip(1),
                        take(1),
                        finalize(done),
                    ).subscribe(([filter]) => {
                        expect(filter.property).toEqual('myNumber');
                        expect(filter.value).toEqual(items.find(i => i.label === menuItemLabel)!.value);
                    });

                menuItem.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();
            });
        });

        describe('Event: search filter change', () => {
            beforeEach(() => {
                component.search = false;
                fixture.detectChanges();
            });

            it('should trigger an event emission when the filter changes', waitForAsync(async () => {
                const items = generateListFactory(() => ({
                    label: faker.random.word(),
                    value: faker.random.number(),
                }))();

                component.dropdownItemList = items;
                fixture.detectChanges();

                const searchFilter = fixture.debugElement.query(By.css('.ui-grid-search-filter')).componentInstance as UiSuggestComponent;

                searchFilter.open();
                fixture.detectChanges();

                await fixture.whenStable();

                searchFilter.updateValue(faker.helpers.randomize(searchFilter.items), true, true);

                fixture.detectChanges();

                const [filter] = await firstValueFrom(grid.filterManager.filter$);

                const [value] = searchFilter.value;

                expect(filter.property).toEqual('myString');
                expect(filter.value).toEqual(items.find(i => i.label === value.text)!.value);
            }));
        });

        describe('Event: search change', () => {
            beforeEach(() => {
                component.search = true;
                fixture.detectChanges();
            });

            it('should trigger an event emission when the search input changes', (done) => {
                const searchTerm = faker.random.word();

                grid.header!.searchFilter
                    .pipe(
                        take(1),
                        finalize(done),
                    ).subscribe(([filter]) => {
                        expect(filter.property).toEqual('myNumber');
                        expect(filter.value).toEqual(searchTerm);
                    });

                const search = fixture.debugElement.query(By.css('ui-grid-search'));
                const input = search.query(By.css('input'));

                input.nativeElement.value = searchTerm;
                input.nativeElement.dispatchEvent(EventGenerator.input());
                fixture.detectChanges();
            });
        });

        describe('Event: sort change', () => {
            beforeEach(() => {
                fixture.detectChanges();
            });

            const SORT_KEY_EVENTS = [
                EventGenerator.keyUp(Key.Enter),
                EventGenerator.keyUp(Key.Space),
            ];

            const SORT_TRANSITIONS = [
                {
                    from: '',
                    to: 'asc',
                },
                {
                    from: 'asc',
                    to: 'desc',
                },
                {
                    from: 'desc',
                    to: '',
                },
            ];

            SORT_TRANSITIONS.forEach(sortTransition => {
                it(`should emit sort event when clicked ('${sortTransition.from}' to '${sortTransition.to}')`, (done) => {
                    const sortableHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell-sortable'));
                    const headerTitle = sortableHeader.query(By.css('.ui-grid-header-title'));

                    const [column] = grid.columns.toArray();

                    column.sort = '';
                    fixture.detectChanges();

                    grid.sortChange
                        .pipe(
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.direction).toBe('asc');
                            expect(sort.direction).toBe(column.sort);
                            expect(sort.field).toBe(column.property!);
                        });

                    headerTitle.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();
                });

                SORT_KEY_EVENTS.forEach(ev => {
                    it(
                        `should emit sort event when key '${ev.key}' is pressed ` +
                        `('${sortTransition.from}' to '${sortTransition.to}')`,
                        (done) => {
                            const sortableHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell-sortable'));
                            const [column] = grid.columns.toArray();

                            column.sort = '';
                            fixture.detectChanges();

                            grid.sortChange
                                .pipe(
                                    take(1),
                                    finalize(done),
                                ).subscribe(sort => {
                                    expect(sort.direction).toBe('asc');
                                    expect(sort.direction).toBe(column.sort);
                                    expect(sort.field).toBe(column.property!);
                                });

                            sortableHeader.nativeElement.dispatchEvent(ev);
                            fixture.detectChanges();
                        });
                });
            });
        });
    });

    @Component({
        template: `
            <ui-grid [data]="data">
                <ui-grid-column [property]="'myNumber'"
                                [sortable]="true"
                                title="Number Header"
                                width="50%">
                </ui-grid-column>
                <ui-grid-column [property]="'myString'"
                                title="String Header"
                                width="50%">
                </ui-grid-column>
                <ui-grid-footer [length]="data.length"
                                [pageSize]="pageSize"
                                [pageIndex]="pageIndex"
                                [pageSizes]="[pageSize, pageSize+1]"
                                [hidePageSize]="hidePageSize"
                                (pageChange)="lastPageChange = $event">
                </ui-grid-footer>
            </ui-grid>
        `,
    })
    class TestFixtureGridFooterComponent {
        @ViewChild(UiGridComponent, {
            static: true,
        })
        grid!: UiGridComponent<ITestEntity>;
        data: ITestEntity[] = [];
        total = 0;
        pageSize = 2;
        pageIndex = 0;
        hidePageSize = true;
        lastPageChange?: PageEvent;
    }

    describe('Scenario: grid with footer', () => {
        let fixture: ComponentFixture<TestFixtureGridFooterComponent>;
        let component: TestFixtureGridFooterComponent;
        let data: ITestEntity[];

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    NoopAnimationsModule,
                ],
                declarations: [TestFixtureGridFooterComponent],
            });

            fixture = TestBed.createComponent(TestFixtureGridFooterComponent);
            component = fixture.componentInstance;
            data = generateListFactory(generateEntity)(6);
            component.data = data;
            component.total = data.length;
            fixture.detectChanges();
        });

        afterEach(() => {
            fixture.destroy();
        });

        describe('State: populated', () => {
            it('should render pagination', () => {
                const matPaginator = fixture.debugElement.query(By.css('.mat-paginator'));
                expect(!!matPaginator).toEqual(true);
            });

            it('should render pageSize if input [hidePageSize]="false"', () => {
                component.hidePageSize = false;
                fixture.detectChanges();

                const pageSize = fixture.debugElement.query(By.css('.mat-paginator-page-size'));
                expect(pageSize).toBeDefined();
            });

            it('should render page range when pageIndex is set', () => {
                component.pageIndex = 1;
                fixture.detectChanges();

                const pageIndexRange = fixture.debugElement.query(By.css('.mat-paginator-range-label'));
                expect(pageIndexRange.nativeElement.textContent.trim()).toBe('3 – 4 of 6');
            });

            it('should NOT render pageSize if input [hidePageSize]="true"', () => {
                const pageSize = fixture.debugElement.query(By.css('.mat-paginator-page-size'));
                expect(pageSize).toBeNull();
            });
        });

        describe('Event: page change', () => {

            it('should start with 0 as initial page index', () => {
                expect(component.grid.footer!.state.pageIndex).toBe(0);
            });

            it('should emit PageEvent object if next page is clicked', () => {
                const next = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));

                next.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                let { previousPageIndex, pageIndex, pageSize, length } = component.lastPageChange!;

                expect(previousPageIndex).toEqual(0);
                expect(pageIndex).toEqual(1);
                expect(pageSize).toEqual(component.pageSize);
                expect(length).toEqual(component.data.length);

                next.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                ({ previousPageIndex, pageIndex, pageSize, length } = component.lastPageChange!);

                expect(previousPageIndex).toEqual(1);
                expect(pageIndex).toEqual(2);
                expect(pageSize).toEqual(component.pageSize);
                expect(length).toEqual(component.data.length);
            });

            it('should update inner state if next page is clicked', () => {
                const next = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));

                next.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                let { previousPageIndex, pageIndex, pageSize, length } = component.grid.footer!.state;

                expect(previousPageIndex).toEqual(0);
                expect(pageIndex).toEqual(1);
                expect(pageSize).toEqual(component.pageSize);
                expect(length).toEqual(component.data.length);

                next.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                ({ previousPageIndex, pageIndex, pageSize, length } = component.grid.footer!.state);

                expect(previousPageIndex).toEqual(1);
                expect(pageIndex).toEqual(2);
                expect(pageSize).toEqual(component.pageSize);
                expect(length).toEqual(component.data.length);
            });
        });

        it('should close all streams when ngOnDestroy is called', () => {
            fixture.detectChanges();

            const destroySpyList = [
                component.grid.dataManager,
                component.grid.resizeManager,
                component.grid.sortManager,
                component.grid.selectionManager,
                component.grid.filterManager,
                component.grid.visibilityManager,
                component.grid.liveAnnouncerManager!,
                (component.grid as any)._performanceMonitor,
            ].map(destroyableClass => spyOn(destroyableClass, 'destroy'));

            const completeSpyList = [
                component.grid.columns$,
                component.grid.isAnyFilterDefined$,
                component.grid.sortChange,
                component.grid.rendered,
                (component.grid as any)._destroyed$,
                (component.grid as any)._configure$,
            ].map(completableStream => spyOn(completableStream, 'complete'));

            component.grid.ngOnDestroy();

            [
                ...destroySpyList,
                ...completeSpyList,
            ].forEach(destroySpy => {
                expect(destroySpy).toHaveBeenCalled();
                expect(destroySpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Scenario: grid with toggle columns', () => {
        @Component({
            template: `
            <ui-grid [data]="data"
                     [toggleColumns]="true">
                <ui-grid-column [property]="'myNumber'"
                                [sortable]="true"
                                title="Number Header"
                                width="50%">
                </ui-grid-column>
                <ui-grid-column [property]="'myString'"
                                title="String Header"
                                width="25%">
                </ui-grid-column>
                <ui-grid-column [property]="'prop2'"
                                title="Prop 2"
                                width="25%">
                </ui-grid-column>
                <ui-grid-column [property]="'prop3'"
                                title="Prop 3"
                                width="25%">
                </ui-grid-column>
            </ui-grid>
        `,
        })
        class TestFixtureGridToggleComponent {
            @ViewChild(UiGridComponent, {
                static: true,
            })
            grid!: UiGridComponent<ITestEntity>;
            data: ITestEntity[] = [];
        }
        describe('Scenario all columns visible', () => {
            let fixture: ComponentFixture<TestFixtureGridToggleComponent>;
            let component: TestFixtureGridToggleComponent;
            let data: ITestEntity[];

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        NoopAnimationsModule,
                    ],
                    declarations: [TestFixtureGridToggleComponent],
                });

                fixture = TestBed.createComponent(TestFixtureGridToggleComponent);
                component = fixture.componentInstance;
                data = generateListFactory(generateEntity)(6);
                component.data = data;
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should close all streams when ngOnDestroy is called', () => {
                const destroySpyList = [
                    component.grid.dataManager,
                    component.grid.resizeManager,
                    component.grid.sortManager,
                    component.grid.selectionManager,
                    component.grid.filterManager,
                    component.grid.visibilityManager,
                    component.grid.liveAnnouncerManager!,
                    (component.grid as any)._performanceMonitor,
                ].map(destroyableClass => spyOn(destroyableClass, 'destroy'));

                const completeSpyList = [
                    component.grid.columns$,
                    component.grid.isAnyFilterDefined$,
                    component.grid.sortChange,
                    component.grid.rendered,
                    (component.grid as any)._destroyed$,
                    (component.grid as any)._configure$,
                ].map(completableStream => spyOn(completableStream, 'complete'));

                component.grid.ngOnDestroy();

                [
                    ...destroySpyList,
                    ...completeSpyList,
                ].forEach(destroySpy => {
                    expect(destroySpy).toHaveBeenCalled();
                    expect(destroySpy).toHaveBeenCalledTimes(1);
                });
            });

            it('should render toggle component', () => {
                const toggleComponent = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-columns'));
                expect(toggleComponent).toBeDefined();
            });

            it('should render toggle button', () => {
                const buttonToggle = fixture.debugElement.query(By.css('.ui-grid-toggle-columns .mat-button')).nativeElement;

                expect(buttonToggle).toBeDefined();
            });

            describe('Scenario: Open', () => {
                let buttonToggle: HTMLButtonElement;

                beforeEach(async () => {
                    fixture.detectChanges();

                    buttonToggle = fixture.debugElement.query(By.css('.ui-grid-toggle-columns .mat-button')).nativeElement;
                    buttonToggle.dispatchEvent(EventGenerator.click);

                    await fixture.whenStable();
                    fixture.detectChanges();
                });

                it('should render an open select menu', () => {
                    const panel = fixture.debugElement.query(By.css('.ui-grid-toggle-panel'));

                    expect(panel).toBeDefined();
                });

                it('should have a select menu with options equal to number of columns', () => {
                    const options = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-panel .mat-option'));

                    expect(options).toBeDefined();
                    expect(options.length).toEqual(4);
                });

                it('should have first visible option disabled', () => {
                    const options = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-panel .mat-option'));

                    options
                        .forEach((o, i) => {
                            expect(o.nativeElement.classList.contains('mat-option-disabled'))
                                .toBe(i === 0);
                        },
                        );
                });

                it('should be able to hide all available columns', fakeAsync(async () => {
                    const options = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-panel .mat-option:not(.mat-option-disabled)'));
                    expect(options.length).toEqual(3);

                    options.forEach(async o => {
                        const checkbox = o.query(By.css('.mat-pseudo-checkbox'));
                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBe(true);

                        checkbox.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBeFalsy();
                    });

                    tick(GRID_COLUMN_CHANGE_DELAY);
                    fixture.detectChanges();
                    const headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(3);
                    discardPeriodicTasks();
                }),
                );

                it('should update grid if options are toggled', fakeAsync(() => {
                    const options = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-panel .mat-option:not(.mat-option-disabled)'));
                    expect(options.length).toEqual(3);

                    options.forEach(async o => {
                        const checkbox = o.query(By.css('.mat-pseudo-checkbox'));
                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBe(true);

                        checkbox.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBeFalsy();
                    });

                    tick(GRID_COLUMN_CHANGE_DELAY);
                    fixture.detectChanges();
                    let headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(3);

                    options.forEach(async o => {
                        const checkbox = o.query(By.css('.mat-pseudo-checkbox'));
                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBeFalsy();

                        checkbox.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBe(true);
                    });

                    tick(GRID_COLUMN_CHANGE_DELAY);
                    fixture.detectChanges();
                    headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                    expect(headers).toBeDefined();
                    expect(headers.length).toEqual(6);
                    discardPeriodicTasks();
                }));

                it('should not render menu if grid has a selection', () => {
                    const checkboxHeader = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell'));

                    const checkboxInput = checkboxHeader.query(By.css('input'));
                    checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();

                    const panel = fixture.debugElement.query(By.css('.ui-grid-toggle-panel'));

                    expect(panel).toBeNull();
                });
            });

            describe('Scenario: Dirty State', () => {
                let buttonToggle: HTMLButtonElement;

                beforeEach(async () => {
                    fixture.detectChanges();

                    buttonToggle = fixture.debugElement.query(By.css('.ui-grid-toggle-columns .mat-button')).nativeElement;
                    buttonToggle.dispatchEvent(EventGenerator.click);

                    await fixture.whenStable();
                    fixture.detectChanges();
                });

                it('should render an open select menu', () => {
                    const panel = fixture.debugElement.query(By.css('.ui-grid-toggle-panel'));

                    expect(panel).toBeDefined();
                });

                it('should render reset button if option is changed', fakeAsync(
                    () => {
                        const firstOption = fixture.debugElement
                            .query(By.css('.ui-grid-toggle-panel .mat-option:not(.mat-option-disabled)'));

                        const checkbox = firstOption.query(By.css('.mat-pseudo-checkbox'));
                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBe(true);

                        checkbox.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBeFalsy();
                        tick(GRID_COLUMN_CHANGE_DELAY);
                        fixture.detectChanges();

                        const reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));

                        expect(reset).toBeDefined();

                        discardPeriodicTasks();
                    }),
                );

                it('should be able to reset if in dirty state', fakeAsync(
                    async () => {
                        const firstOption = fixture.debugElement
                            .query(By.css('.ui-grid-toggle-panel .mat-option:not(.mat-option-disabled)'));

                        const checkbox = firstOption.query(By.css('.mat-pseudo-checkbox'));
                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBe(true, 'first option NOT checked initially');

                        checkbox.nativeElement.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();

                        expect(checkbox.classes['mat-pseudo-checkbox-checked']).toBeFalsy('first option still checked after click');
                        tick(GRID_COLUMN_CHANGE_DELAY);
                        fixture.detectChanges();

                        let reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));

                        expect(reset).toBeDefined();
                        reset.nativeElement.dispatchEvent(EventGenerator.click);
                        tick(GRID_COLUMN_CHANGE_DELAY);
                        fixture.detectChanges();

                        const headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                        expect(headers).toBeDefined();
                        expect(headers.length).toEqual(6, 'Not all columns rendered');

                        buttonToggle = fixture.debugElement.query(By.css('.ui-grid-toggle-columns .mat-button')).nativeElement;
                        buttonToggle.dispatchEvent(EventGenerator.click);

                        fixture.detectChanges();

                        reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));
                        expect(reset).toBeNull('Reset still rendered');

                        discardPeriodicTasks();
                        flush();
                    }),
                );

                describe('Behavior: Keyboard Navigation', () => {
                    beforeEach(
                        fakeAsync(
                            () => {
                                const firstOption = fixture.debugElement
                                    .query(By.css('.ui-grid-toggle-panel .mat-option:not(.mat-option-disabled)'));
                                const checkbox = firstOption.query(By.css('.mat-pseudo-checkbox'));
                                checkbox.nativeElement.dispatchEvent(EventGenerator.click);

                                tick(GRID_COLUMN_CHANGE_DELAY);
                                fixture.detectChanges();

                                discardPeriodicTasks();
                            },
                        ),
                    );

                    it('should be able to navigate to reset button and back using arrows',
                        fakeAsync(
                            async () => {
                                const toggleComponent = fixture.debugElement.query(By.css('.ui-grid-toggle-columns'));
                                const reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));

                                expect(reset.nativeElement).not.toEqual(document.activeElement, 'Reset is already focused');

                                toggleComponent.nativeElement.dispatchEvent(
                                    EventGenerator.keyDown(Key.ArrowUp),
                                );
                                fixture.detectChanges();

                                expect(
                                    reset.nativeElement,
                                ).toBe(document.activeElement, 'Reset is NOT focused!');

                                toggleComponent.nativeElement.dispatchEvent(
                                    EventGenerator.keyDown(Key.ArrowDown),
                                );
                                fixture.detectChanges();

                                expect(reset.nativeElement).not.toEqual(document.activeElement, 'Reset is still focused');

                                const highlightedOption = fixture.debugElement.query(By.css('.mat-option.mat-active'));

                                expect(highlightedOption).toBeDefined();
                                discardPeriodicTasks();
                                flush();
                            },
                        ),
                    );

                    [
                        EventGenerator.keyDown(Key.Enter),
                        EventGenerator.keyDown(Key.Space),
                        EventGenerator.click,
                    ].forEach(e => {
                        it(`should be able to reset on (${e instanceof KeyboardEvent ? `keydown."` + e.code.toLowerCase() + `"` : 'click'})`,
                            fakeAsync(() => {
                                const reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));

                                reset.nativeElement.dispatchEvent(e);

                                tick(GRID_COLUMN_CHANGE_DELAY);
                                fixture.detectChanges();

                                const headers = fixture.debugElement.queryAll(By.css('.ui-grid-header-cell'));

                                expect(headers).toBeDefined();
                                expect(headers.length).toEqual(6, 'Not all columns rendered');

                                expect(
                                    fixture.debugElement.query(By.css('.mat-select')).nativeElement,
                                ).toBe(document.activeElement, 'Menu is not selected');

                                discardPeriodicTasks();
                                flush();
                            }),
                        );
                    });

                    it('should be able to enable all options after focusing on Reset',
                        fakeAsync(
                            async () => {
                                const toggleComponent = fixture.debugElement.query(By.css('.ui-grid-toggle-columns'));
                                let reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));

                                expect(reset.nativeElement).not.toEqual(document.activeElement, 'Reset is already focused');

                                toggleComponent.nativeElement.dispatchEvent(
                                    EventGenerator.keyDown(Key.ArrowUp),
                                );
                                fixture.detectChanges();

                                expect(
                                    reset.nativeElement,
                                ).toBe(document.activeElement, 'Reset is NOT focused!');

                                toggleComponent.nativeElement.dispatchEvent(
                                    EventGenerator.keyDown(Key.ArrowDown),
                                );
                                fixture.detectChanges();

                                expect(reset.nativeElement).not.toEqual(document.activeElement, 'Reset is still focused');

                                const highlightedOption = fixture.debugElement.query(By.css('.mat-option.mat-active'));
                                const checkbox = highlightedOption.query(By.css('.mat-pseudo-checkbox'));

                                checkbox.nativeElement.dispatchEvent(EventGenerator.click);

                                tick(GRID_COLUMN_CHANGE_DELAY);
                                fixture.detectChanges();
                                await fixture.whenStable();

                                reset = fixture.debugElement.query(By.css('.ui-grid-toggle-reset'));
                                expect(reset).toBeNull('Reset still available after restoring full selection');
                                discardPeriodicTasks();
                                flush();
                            },
                        ),
                    );
                });
            });
        });

        @Component({
            template: `
            <ui-grid [data]="data"
                     [toggleColumns]="true">
                <ui-grid-column [property]="'myNumber'"
                                [visible]="false"
                                title="Number Header"
                                width="50%">
                </ui-grid-column>
                <ui-grid-column [property]="'myString'"
                                title="String Header"
                                width="25%">
                </ui-grid-column>
                <ui-grid-column [property]="'prop2'"
                                [disableToggle]="true"
                                title="Prop 2"
                                width="25%">
                </ui-grid-column>
                <ui-grid-column [property]="'prop3'"
                                [disableToggle]="true"
                                [visible]="false"
                                title="Prop 3"
                                width="5%">
                </ui-grid-column>
                <ui-grid-column [property]="'prop4'"
                                [disableToggle]="true"
                                [visible]="false"
                                title="Prop 4"
                                width="5%">
                </ui-grid-column>
                <ui-grid-column [property]="'prop5'"
                                [disableToggle]="true"
                                [visible]="false"
                                title="Prop 5"
                                width="5%">
                </ui-grid-column>
            </ui-grid>
        `,
        })
        class TestFixtureGridToggleHiddenComponent {
            @ViewChild(UiGridComponent, {
                static: true,
            })
            grid!: UiGridComponent<ITestEntity>;
            data: ITestEntity[] = [];
        }
        describe('Scenario hidden columns', () => {
            let fixture: ComponentFixture<TestFixtureGridToggleHiddenComponent>;
            let component: TestFixtureGridToggleHiddenComponent;
            let data: ITestEntity[];

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        NoopAnimationsModule,
                    ],
                    declarations: [TestFixtureGridToggleHiddenComponent],
                });

                fixture = TestBed.createComponent(TestFixtureGridToggleHiddenComponent);
                component = fixture.componentInstance;
                data = generateListFactory(generateEntity)(6);
                component.data = data;
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should render toggle component', () => {
                const toggleComponent = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-columns'));
                expect(toggleComponent).toBeDefined();
            });

            it('should render toggle icon button', () => {
                const buttonToggle = fixture.debugElement.query(By.css('.ui-grid-toggle-columns .mat-button')).nativeElement;
                expect(buttonToggle).toBeDefined();
            });

            describe('Scenario: Open', () => {
                let buttonToggle: HTMLButtonElement;

                beforeEach(async () => {
                    fixture.detectChanges();

                    buttonToggle = fixture.debugElement.query(By.css('.ui-grid-toggle-columns .mat-button')).nativeElement;
                    buttonToggle.dispatchEvent(EventGenerator.click);

                    await fixture.whenStable();
                    fixture.detectChanges();
                });

                it('should not render columns hidden and with disableToggle', () => {
                    fixture.detectChanges();
                    const options = fixture.debugElement.queryAll(By.css('.ui-grid-toggle-panel .mat-option'));

                    expect(options).toBeDefined();
                    expect(options.length).toEqual(3);
                });

                it('should render option as disabled if disableToggle is set to true', () => {
                    fixture.detectChanges();
                    const option = fixture.debugElement.query(By.css('.ui-grid-toggle-panel .mat-option-disabled'));

                    expect(option).toBeDefined();
                    expect(option.nativeElement.innerText).toEqual('Prop 2');
                });
            });
        });
    });

    describe('Scenario: alternate design', () => {
        describe('Behavior: use injection token value', () => {
            @Component({
                template: `
                <ui-grid [toggleColumns]="true">
                    <ui-grid-header>
                    </ui-grid-header>
                    <ui-grid-column property="id">
                    </ui-grid-column>
                    <ui-grid-footer [length]="5"
                                    [pageSize]="5">
                    </ui-grid-footer>
                </ui-grid>
                `,
            })
            class TestFixtureAlternateDesignGridComponent {
            }

            let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        UiGridCustomPaginatorModule,
                        NoopAnimationsModule,
                    ],
                    providers: [
                        UiMatPaginatorIntl,
                        {
                            provide: UI_GRID_OPTIONS,
                            useValue: {
                                useLegacyDesign: false,
                            },
                        },
                    ],
                    declarations: [
                        TestFixtureAlternateDesignGridComponent,
                    ],
                });

                fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should use injection token value', () => {
                const customFooter = fixture.debugElement.query(By.css('ui-grid-custom-paginator'));
                expect(customFooter).toBeTruthy();

                const customFilters = fixture.debugElement.query(By.css('ui-grid-toggle-columns .mat-button-wrapper span'));
                expect(customFilters.nativeElement.innerText).toBe('Columns');
            });
        });

        describe('Behavior: grid with no data', () => {
            @Component({
                template: `
                <ui-grid [data]="data"
                         [toggleColumns]="true">
                    <ui-grid-header [search]="true">
                    </ui-grid-header>
                    <ui-grid-column [searchable]="true"
                                    property="id">
                        <ui-grid-dropdown-filter [items]="filterItems">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                    <ui-grid-footer [length]="5"
                                    [pageSize]="5">
                    </ui-grid-footer>
                </ui-grid>
                `,
            })
            class TestFixtureAlternateDesignGridComponent {
                data: ITestEntity[] = [];

                get filterItems(): IDropdownOption[] {
                    return [1, 2, 3].map(count => ({
                        value: count,
                        label: count.toString(),
                    }));
                }
            }

            let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;
            const intl = new UiGridIntl();
            intl.noDataMessageAlternative = (searchValue, activeFilters) => 'table_no_data'.concat(
                searchValue ? '_search' : '',
                activeFilters ? '_filters' : '',
            );

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        UiGridCustomPaginatorModule,
                        NoopAnimationsModule,
                    ],
                    providers: [
                        {
                            provide: UiGridIntl,
                            useValue: intl,
                        },
                        {
                            provide: UI_GRID_OPTIONS,
                            useValue: {
                                useLegacyDesign: false,
                            },
                        },
                    ],
                    declarations: [
                        TestFixtureAlternateDesignGridComponent,
                    ],
                });

                fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should use proper template when no data', () => {
                const noDataContent = fixture.debugElement.query(By.css('.ui-grid-row.ui-grid-no-data-container'));
                expect(noDataContent).toBeTruthy();
                expect(noDataContent.classes['ui-grid-no-content-available']).toBeTrue();
                expect(noDataContent.nativeElement.innerText).toContain('table_no_data');
            });

            it('should use proper template when no data for search', fakeAsync(() => {
                const debounceTime = 500;
                const searchInput = fixture.debugElement.query(By.css('input.mat-input-element'));
                const randomInput = faker.random.alphaNumeric(10);

                searchInput.nativeElement.value = randomInput;
                searchInput.nativeElement.dispatchEvent(EventGenerator.input());

                tick(debounceTime);
                fixture.detectChanges();

                const noDataContent = fixture.debugElement.query(By.css('.ui-grid-row.ui-grid-no-data-container'));
                expect(noDataContent).toBeTruthy();
                expect(noDataContent.classes['ui-grid-no-content-available']).toBeFalsy();

                expect(noDataContent.nativeElement.innerText).toContain('table_no_data_search');

                discardPeriodicTasks();
            }));

            it('should use proper template when no data with filters', () => {
                const filterButton = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-button'));
                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const filterFirstOptionButton = fixture.debugElement.query(By.css('button.mat-menu-item:not(.active)'));
                filterFirstOptionButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const noDataContent = fixture.debugElement.query(By.css('.ui-grid-row.ui-grid-no-data-container'));
                expect(noDataContent).toBeTruthy();
                expect(noDataContent.classes['ui-grid-no-content-available']).toBeFalsy();
                expect(noDataContent.nativeElement.innerText).toContain('table_no_data_filters');
            });

            it('should use proper template when no data with filters and search', fakeAsync(() => {

                const filterButton = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-button'));
                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const filterFirstOptionButton = fixture.debugElement.query(By.css('button.mat-menu-item:not(.active)'));
                filterFirstOptionButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const debounceTime = 500;
                const searchInput = fixture.debugElement.query(By.css('input.mat-input-element'));
                const randomInput = faker.random.alphaNumeric(10);

                searchInput.nativeElement.value = randomInput;
                searchInput.nativeElement.dispatchEvent(EventGenerator.input());

                tick(debounceTime);
                fixture.detectChanges();
                flush();

                const noDataContent = fixture.debugElement.query(By.css('.ui-grid-row.ui-grid-no-data-container'));
                expect(noDataContent).toBeTruthy();
                expect(noDataContent.classes['ui-grid-no-content-available']).toBeFalsy();
                expect(noDataContent.nativeElement.innerText).toContain('table_no_data_search_filters');

                discardPeriodicTasks();
            }));
        });

        describe('Behavior: override injection token value', () => {
            @Component({
                template: `
                <ui-grid [toggleColumns]="true"
                         [useLegacyDesign]="true">
                    <ui-grid-header>
                    </ui-grid-header>
                    <ui-grid-column property="id">
                    </ui-grid-column>
                    <ui-grid-footer [length]="5"
                                    [pageSize]="5">
                    </ui-grid-footer>
                </ui-grid>
                `,
            })
            class TestFixtureAlternateDesignGridComponent {
            }

            let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        UiGridCustomPaginatorModule,
                    ],
                    providers: [
                        UiMatPaginatorIntl,
                        {
                            provide: UI_GRID_OPTIONS,
                            useValue: {
                                useLegacyDesign: false,
                            },
                        },
                    ],
                    declarations: [
                        TestFixtureAlternateDesignGridComponent,
                    ],
                });

                fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should override injection token value', () => {
                const customFooter = fixture.debugElement.query(By.css('ui-grid-custom-paginator'));
                expect(customFooter).toBeFalsy();

                const customFilters = fixture.debugElement.query(By.css('ui-grid-toggle-columns .mat-button-wrapper span'));
                expect(customFilters).toBeFalsy();
            });
        });

        describe('Scenario: multi page selection', () => {
            @Component({
                template: `
                <ui-grid [data]="data"
                         [toggleColumns]="true"
                         [multiPageSelect]="true">
                    <ui-grid-header>
                        <ui-header-button type="action">
                            <ng-template>
                                <button class="action">action</button>
                            </ng-template>
                        </ui-header-button>
                        <ui-header-button type="action">
                            <ng-template>
                                <button class="action">action</button>
                            </ng-template>
                        </ui-header-button>
                        <ui-header-button type="inline">
                            <ng-template>
                                <button class="inline">inline</button>
                            </ng-template>
                        </ui-header-button>
                        <ui-header-button type="main">
                            <ng-template>
                                <button class="main">main</button>
                            </ng-template>
                        </ui-header-button>
                    </ui-grid-header>
                    <ui-grid-column property="id">
                    </ui-grid-column>
                    <ui-grid-column property="name">
                    </ui-grid-column>
                    <ui-grid-footer [length]="5"
                                    [pageSize]="5">
                    </ui-grid-footer>
                </ui-grid>
                `,
            })
            class TestFixtureAlternateDesignGridComponent {
                data: ITestEntity[] = [];
            }

            let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;
            let data: ITestEntity[];

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        UiGridCustomPaginatorModule,
                        NoopAnimationsModule,
                    ],
                    providers: [
                        UiMatPaginatorIntl,
                        {
                            provide: UI_GRID_OPTIONS,
                            useValue: {
                                useLegacyDesign: false,
                            },
                        },
                    ],
                    declarations: [
                        TestFixtureAlternateDesignGridComponent,
                    ],
                });

                fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                data = generateListFactory(generateEntity)(6);
                fixture.componentInstance.data = data;

                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should render selection', () => {
                const selectionInfoContainer = fixture.debugElement.query(By.css('.ui-grid-selection-info-container'));
                expect(selectionInfoContainer).toBeTruthy();
            });

            it('should render correct text', () => {
                const selectAll = fixture.debugElement.query(By.css('.ui-grid-header mat-checkbox input'));
                selectAll.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const selectionInfoMessage = fixture.debugElement.query(By.css('.ui-grid-selection-info-message'));
                expect(selectionInfoMessage.nativeElement).toContainText('You have selected 6 items.');
            });

            it('should hide inline buttons on selection', () => {
                const selectAll = fixture.debugElement.query(By.css('.ui-grid-header mat-checkbox input'));
                selectAll.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const buttons = fixture.debugElement.queryAll(By.css('.ui-grid-filter-container button'));
                buttons.forEach(button => expect(button.classes.inline).toBeFalsy());
            });
        });
    });

    describe('Scenario: collapse filters', () => {
        describe('Legacy: collapsible', () => {
            describe('Behavior: grid disabled', () => {
                @Component({
                    template: `
                <ui-grid disabled>
                    <ui-grid-header [search]="true">
                    </ui-grid-header>
                    <ui-grid-column [searchable]="true"
                                    [sortable]="true"
                                    [disableToggle]="true"
                                    property="id"
                                    title="Id">
                        <ui-grid-dropdown-filter [items]="filterItems">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                    <ui-grid-column property="name"
                                    title="Name">
                        <ui-grid-search-filter [searchSourceFactory]="searchFactory"></ui-grid-search-filter>
                    </ui-grid-column>
                    <ui-grid-footer [length]="5"
                                    [pageSize]="5">
                    </ui-grid-footer>
                </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }

                    searchFactory = (): Observable<ISuggestValues<any>> => of({
                        data: this.filterItems
                            .map(
                                option => ({
                                    id: +option.value,
                                    text: option.label,
                                }),
                            ),
                        total: this.filterItems.length,
                    });
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    useLegacyDesign: false,
                                    collapsibleFilters: true,
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    fixture.detectChanges();
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should have collapsible toggle disabled', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));

                    expect(collapisbleFiltersToggle).toBeTruthy();
                    expect(collapisbleFiltersToggle.nativeElement.getAttribute('disabled')).toBeTruthy();
                });
            });

            describe('Behavior: collapsible filters', () => {
                @Component({
                    template: `
                <ui-grid>
                    <ui-grid-header [search]="true">
                    </ui-grid-header>
                    <ui-grid-column [searchable]="true"
                                    [sortable]="true"
                                    [disableToggle]="true"
                                    property="id"
                                    title="Id">
                        <ui-grid-dropdown-filter [items]="filterItems"
                                                 [visible]="visible">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                    <ui-grid-footer [length]="5"
                                    [pageSize]="5">
                    </ui-grid-footer>
                </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }

                    visible = true;
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;
                let component: TestFixtureAlternateDesignGridComponent;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    useLegacyDesign: false,
                                    collapsibleFilters: true,
                                    fetchStrategy: 'eager',
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should use collapsible filters', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    expect(collapisbleFiltersToggle).toBeTruthy();
                });

                it('should not display collapsible toggle button if no filter visible', () => {
                    component.visible = false;
                    fixture.detectChanges();

                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    expect(collapisbleFiltersToggle).toBeFalsy();
                });

                it('should display the correct filter label', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    const collapisbleFiltersToggleText = fixture.debugElement
                        .query(By.css('.ui-grid-collapsible-filters-toggle span span'));
                    collapisbleFiltersToggle.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    const filterButton = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-button'));
                    filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    const filterFirstOptionButton = fixture.debugElement.query(By.css('button.mat-menu-item:not(.active)'));
                    filterFirstOptionButton.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    expect(collapisbleFiltersToggleText.nativeElement.innerText).toBe('Filters (1)');
                });

                it('should toggle filters', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    let filtersRow = fixture.debugElement.query(By.css('.ui-grid-alternate-filter-container'));
                    expect(filtersRow).toBeFalsy();

                    collapisbleFiltersToggle.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    filtersRow = fixture.debugElement.query(By.css('.ui-grid-alternate-filter-container'));
                    expect(filtersRow).toBeTruthy();
                });
            });

            describe('Behaviour: use empty state value for filters', () => {
                @Component({
                    template: `
                <ui-grid>
                    <ui-grid-header [search]="true">
                    </ui-grid-header>
                    <ui-grid-column property="id"
                                    title="Id">
                        <ui-grid-dropdown-filter [items]="filterItems"
                                                 [visible]="true"
                                                 [value]="value"
                                                 [emptyStateValue]="emptyStateValue">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }
                    value?: IDropdownOption;
                    emptyStateValue?: IDropdownOption['value'];
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;
                let component: TestFixtureAlternateDesignGridComponent;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    useLegacyDesign: false,
                                    collapsibleFilters: true,
                                    fetchStrategy: 'eager',
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    component = fixture.componentInstance;
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should count applied default filter when there is not empty filter state', () => {
                    component.value = {
                        value: '123',
                        label: '123',
                    };
                    fixture.detectChanges();

                    const collapisbleFiltersToggleText = fixture.debugElement
                        .query(By.css('.ui-grid-collapsible-filters-toggle span span'));

                    expect(collapisbleFiltersToggleText.nativeElement.innerText).toBe('Filters (1)');
                });

                it('should count applied default filter when it is different from the empty filter state', fakeAsync(() => {
                    component.value = {
                        value: '123',
                        label: '123',
                    };
                    component.emptyStateValue = '12';
                    fixture.detectChanges();

                    const collapisbleFiltersToggleText = fixture.debugElement
                        .query(By.css('.ui-grid-collapsible-filters-toggle span span'));

                    expect(collapisbleFiltersToggleText.nativeElement.innerText).toBe('Filters (1)');
                    expect(fixture.debugElement.query(By.css('.ui-grid-header-title-filtered'))).toBeTruthy();
                    tick(1000);
                }));

                it('should not count applied default filter when it is equal to empty filter state', () => {
                    fixture.componentInstance.value = {
                        value: '123',
                        label: '123',
                    };
                    component.emptyStateValue = '123';
                    fixture.detectChanges();

                    const collapisbleFiltersToggleText = fixture.debugElement
                        .query(By.css('.ui-grid-collapsible-filters-toggle span span'));

                    expect(collapisbleFiltersToggleText.nativeElement.innerText).toBe('Filters');
                    expect(fixture.debugElement.query(By.css('.ui-grid-header-title-filtered'))).toBeNull();
                });
            });

            describe('Behavior: override injection token value', () => {
                @Component({
                    template: `
                <ui-grid [collapsibleFilters]="false" [fetchStrategy]="'onOpen'">
                    <ui-grid-header>
                    </ui-grid-header>
                    <ui-grid-column property="id"
                                    title="Id">
                        <ui-grid-dropdown-filter [items]="filterItems">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                    <ui-grid-column property="name"
                                    title="Name">
                        <ui-grid-search-filter [searchSourceFactory]="searchFactory"></ui-grid-search-filter>
                    </ui-grid-column>
                    <ui-grid-column property="another"
                                    title="Another">
                        <ui-grid-search-filter [fetchStrategy]="'eager'" [searchSourceFactory]="searchFactory"></ui-grid-search-filter>
                    </ui-grid-column>
                </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }

                    searchFactory = (): Observable<ISuggestValues<any>> => of({
                        data: this.filterItems
                            .map(
                                option => ({
                                    id: +option.value,
                                    text: option.label,
                                }),
                            ),
                        total: this.filterItems.length,
                    });
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    collapsibleFilters: true,
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    fixture.detectChanges();
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should override injection token value for collapsible filters', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    expect(collapisbleFiltersToggle).toBeFalsy();
                });

                it('should override injection token value for fetchStrategy by grid and directive input', () => {
                    const nameSuggestStrategy = fixture.debugElement
                        .query(By.css('[data-cy="ui-grid-search-filter-name"][ng-reflect-fetch-strategy="onOpen"]'));
                    expect(nameSuggestStrategy).toBeTruthy('NO name filter');

                    const otherSuggestStrategy = fixture.debugElement
                        .query(By.css('[data-cy="ui-grid-search-filter-another"][ng-reflect-fetch-strategy="eager"]'));
                    expect(otherSuggestStrategy).toBeTruthy('NO another filter');
                });
            });
        });

        describe('Recommended: collapseFiltersCount', () => {
            describe('Behavior: grid disabled', () => {
                @Component({
                    template: `
                            <ui-grid disabled>
                                <ui-grid-header [search]="true">
                                </ui-grid-header>
                                <ui-grid-column [searchable]="true"
                                                [sortable]="true"
                                                [disableToggle]="true"
                                                property="id"
                                                title="Id">
                                    <ui-grid-dropdown-filter [items]="filterItems">
                                    </ui-grid-dropdown-filter>
                                </ui-grid-column>
                                <ui-grid-column property="name"
                                                title="Name">
                                    <ui-grid-search-filter [searchSourceFactory]="searchFactory"></ui-grid-search-filter>
                                </ui-grid-column>
                                <ui-grid-footer [length]="5"
                                                [pageSize]="5">
                                </ui-grid-footer>
                            </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }

                    searchFactory = (): Observable<ISuggestValues<any>> => of({
                        data: this.filterItems
                            .map(
                                option => ({
                                    id: +option.value,
                                    text: option.label,
                                }),
                            ),
                        total: this.filterItems.length,
                    });
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    useLegacyDesign: false,
                                    collapseFiltersCount: 0,
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    fixture.detectChanges();
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should have collapsible toggle disabled', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));

                    expect(collapisbleFiltersToggle).toBeTruthy();
                    expect(collapisbleFiltersToggle.nativeElement.getAttribute('disabled')).toBeTruthy();
                });
            });

            describe('Behavior: collapsible filters', () => {
                @Component({
                    template: `
                            <ui-grid>
                                <ui-grid-header [search]="true">
                                </ui-grid-header>
                                <ui-grid-column [searchable]="true"
                                                [sortable]="true"
                                                [disableToggle]="true"
                                                property="id"
                                                title="Id">
                                    <ui-grid-dropdown-filter [items]="filterItems"
                                                            [visible]="visible">
                                    </ui-grid-dropdown-filter>
                                </ui-grid-column>
                                <ui-grid-footer [length]="5"
                                                [pageSize]="5">
                                </ui-grid-footer>
                            </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }

                    visible = true;
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;
                let component: TestFixtureAlternateDesignGridComponent;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    useLegacyDesign: false,
                                    collapseFiltersCount: 0,
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should use collapsible filters', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    expect(collapisbleFiltersToggle).toBeTruthy();
                });

                it('should not display collapsible toggle button if no filter visible', () => {
                    component.visible = false;
                    fixture.detectChanges();

                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    expect(collapisbleFiltersToggle).toBeFalsy();
                });

                it('should display the correct filter label', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    const collapisbleFiltersToggleText = fixture.debugElement
                        .query(By.css('.ui-grid-collapsible-filters-toggle span span'));
                    collapisbleFiltersToggle.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    const filterButton = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-button'));
                    filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    const filterFirstOptionButton = fixture.debugElement.query(By.css('button.mat-menu-item:not(.active)'));
                    filterFirstOptionButton.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    expect(collapisbleFiltersToggleText.nativeElement.innerText).toBe('Filters (1)');
                });

                it('should toggle filters', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    let filtersRow = fixture.debugElement.query(By.css('.ui-grid-alternate-filter-container'));
                    expect(filtersRow).toBeFalsy();

                    collapisbleFiltersToggle.nativeElement.dispatchEvent(EventGenerator.click);
                    fixture.detectChanges();

                    filtersRow = fixture.debugElement.query(By.css('.ui-grid-alternate-filter-container'));
                    expect(filtersRow).toBeTruthy();
                });
            });

            describe('Behavior: override injection token value', () => {
                @Component({
                    template: `
                <ui-grid [collapseFiltersCount]="2" [fetchStrategy]="'onOpen'">
                    <ui-grid-header>
                    </ui-grid-header>
                    <ui-grid-column property="id"
                                    title="Id">
                        <ui-grid-dropdown-filter [items]="filterItems">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                    <ui-grid-column property="name"
                                    title="Name">
                        <ui-grid-search-filter [searchSourceFactory]="searchFactory"></ui-grid-search-filter>
                    </ui-grid-column>
                </ui-grid>
                `,
                })
                class TestFixtureAlternateDesignGridComponent {
                    get filterItems(): IDropdownOption[] {
                        return [1, 2, 3].map(count => ({
                            value: count,
                            label: count.toString(),
                        }));
                    }

                    searchFactory = (): Observable<ISuggestValues<any>> => of({
                        data: this.filterItems
                            .map(
                                option => ({
                                    id: +option.value,
                                    text: option.label,
                                }),
                            ),
                        total: this.filterItems.length,
                    });
                }

                let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        imports: [
                            UiGridModule,
                            UiGridCustomPaginatorModule,
                            NoopAnimationsModule,
                        ],
                        providers: [
                            UiMatPaginatorIntl,
                            {
                                provide: UI_GRID_OPTIONS,
                                useValue: {
                                    collapseFiltersCount: 0,
                                },
                            },
                        ],
                        declarations: [
                            TestFixtureAlternateDesignGridComponent,
                        ],
                    });

                    fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
                    fixture.detectChanges();
                });

                afterEach(() => {
                    fixture.destroy();
                });

                it('should override injection token value for collapsible filters', () => {
                    const collapisbleFiltersToggle = fixture.debugElement.query(By.css('.ui-grid-collapsible-filters-toggle'));
                    expect(collapisbleFiltersToggle).toBeFalsy();
                });

                it('should override injection token value for fetchStrategy on searchable', () => {
                    const suggestOnOpen = fixture.debugElement
                        .query(By.css('[data-cy="ui-grid-search-filter-name"][ng-reflect-fetch-strategy="onOpen"]'));
                    expect(suggestOnOpen).toBeTruthy();
                });
            });
        });
    });

    describe('Scenario: Grid State Templates', () => {
        @Component({
            template: `
            <ui-grid [data]="data" [loading]="loading">
                <ui-grid-header [search]="true">
                </ui-grid-header>
                <ui-grid-column [searchable]="true"
                                [sortable]="true"
                                property="id"
                                title="Id">
                    <ui-grid-dropdown-filter [items]="filterItems">
                    </ui-grid-dropdown-filter>
                </ui-grid-column>
                <ui-grid-no-content>
                    <ng-template let-search="search"
                                 let-activeCount="activeCount">
                        <div id="no-data-template">No data</div>
                        <div id="search-text">{{search}}</div>
                        <div id="active-count">{{activeCount}}</div>
                    </ng-template>
                </ui-grid-no-content>
                <ui-grid-loading>
                    <ng-template>
                        <div id="loading-template">
                            Loading ...
                        </div>
                    </ng-template>
                </ui-grid-loading>
            </ui-grid>
            `,
        })
        class TestFixtureCustomStatesComponent {
            @ViewChild(UiGridComponent, {
                static: true,
            })
            grid!: UiGridComponent<ITestEntity>;
            data: ITestEntity[] = [];
            loading = false;

            get filterItems(): IDropdownOption[] {
                return [1, 2, 3].map(count => ({
                    value: count,
                    label: count.toString(),
                }));
            }
        }

        describe('Behavior: custom templates', () => {
            let fixture: ComponentFixture<TestFixtureCustomStatesComponent>;
            let component: TestFixtureCustomStatesComponent;

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        NoopAnimationsModule,
                    ],
                    declarations: [
                        TestFixtureCustomStatesComponent,
                    ],
                });

                fixture = TestBed.createComponent(TestFixtureCustomStatesComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should display custom no data template', () => {
                const noDataElement = fixture.debugElement.query(By.css('#no-data-template'));
                expect(noDataElement).toBeTruthy();
            });

            it('should display custom loading template', () => {
                component.loading = true;
                fixture.detectChanges();

                const loadingElement = fixture.debugElement.query(By.css('#loading-template'));
                expect(loadingElement).toBeTruthy();
            });

            it('should hide default spiner on loading', () => {
                component.loading = true;
                fixture.detectChanges();

                const defaultSpinner = fixture.debugElement.query(By.css('mat-progress-bar'));
                expect(defaultSpinner).toBeFalsy();
            });

            it('should hide no data template on loading', () => {
                component.loading = true;
                fixture.detectChanges();

                const loadingElement = fixture.debugElement.query(By.css('#no-data-template'));
                expect(loadingElement).toBeFalsy();
            });

            it('should provide correct number of filters', () => {
                const activeFiltersCount = fixture.debugElement.query(By.css('#active-count'));
                expect(activeFiltersCount.nativeElement.innerText).toBe('0');

                const filterButton = fixture.debugElement.query(By.css('.ui-grid-dropdown-filter-button'));
                filterButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const filterFirstOptionButton = fixture.debugElement.query(By.css('button.mat-menu-item:not(.active)'));
                filterFirstOptionButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                expect(activeFiltersCount.nativeElement.innerText).toBe('1');
            });

            it('should provide search context', fakeAsync(() => {
                const debounceTime = 500;
                const searchString = fixture.debugElement.query(By.css('#search-text'));
                const searchInput = fixture.debugElement.query(By.css('input.mat-input-element'));
                const randomInput = faker.random.alphaNumeric(10);

                searchInput.nativeElement.value = randomInput;
                searchInput.nativeElement.dispatchEvent(EventGenerator.input());

                tick(debounceTime);
                fixture.detectChanges();

                expect(searchInput).toBeDefined();
                expect(searchString.nativeElement.innerText).toBe(randomInput);

                discardPeriodicTasks();
            }));
        });

        @Component({
            template: `
            <ui-grid [data]="data" [loading]="loading">
            </ui-grid>
            `,
        })
        class TestFixtureDefaultStatesComponent {
            @ViewChild(UiGridComponent, {
                static: true,
            })
            grid!: UiGridComponent<ITestEntity>;
            data: ITestEntity[] = [];
            loading = false;
        }
        describe('Behavior: default state templates', () => {
            let fixture: ComponentFixture<TestFixtureDefaultStatesComponent>;
            let component: TestFixtureDefaultStatesComponent;

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [
                        UiGridModule,
                        NoopAnimationsModule,
                    ],
                    declarations: [
                        TestFixtureCustomStatesComponent,
                    ],
                });

                fixture = TestBed.createComponent(TestFixtureCustomStatesComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });

            afterEach(() => {
                fixture.destroy();
            });

            it('should hide default no data state on loading', () => {
                component.loading = true;
                fixture.detectChanges();

                const defaultNoData = fixture.debugElement.query(By.css('ui-grid-no-data-container'));
                expect(defaultNoData).toBeFalsy();
            });
        });
    });

    describe('Scenario: multiple main actions', () => {
        @Component({
            template: `
            <ui-grid [data]="data"
                     [toggleColumns]="true"
                     [multiPageSelect]="false">
                <ui-grid-header>
                    <ui-header-button type="action">
                        <ng-template>
                            <button class="action">action</button>
                        </ng-template>
                    </ui-header-button>
                    <ui-header-button type="action">
                        <ng-template>
                            <button class="action">action</button>
                        </ng-template>
                    </ui-header-button>
                    <ui-header-button type="inline">
                        <ng-template>
                            <button class="inline">inline</button>
                        </ng-template>
                    </ui-header-button>
                    <ui-header-button type="main">
                        <ng-template>
                            <button class="main">main</button>
                        </ng-template>
                    </ui-header-button>
                    <ui-header-button type="main">
                        <ng-template>
                            <button class="main">main 2</button>
                        </ng-template>
                    </ui-header-button>
                </ui-grid-header>
                <ui-grid-column property="id">
                </ui-grid-column>
                <ui-grid-column property="name">
                </ui-grid-column>
                <ui-grid-footer [length]="5"
                                [pageSize]="5">
                </ui-grid-footer>
            </ui-grid>
            `,
        })
        class TestFixtureAlternateDesignGridComponent {
            data: ITestEntity[] = [];
        }

        let fixture: ComponentFixture<TestFixtureAlternateDesignGridComponent>;
        let data: ITestEntity[];

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    UiGridCustomPaginatorModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    UiMatPaginatorIntl,
                    {
                        provide: UI_GRID_OPTIONS,
                        useValue: {
                            useLegacyDesign: false,
                        },
                    },
                ],
                declarations: [
                    TestFixtureAlternateDesignGridComponent,
                ],
            });

            fixture = TestBed.createComponent(TestFixtureAlternateDesignGridComponent);
            data = generateListFactory(generateEntity)(6);
            fixture.componentInstance.data = data;

            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should have multiple main actions', () => {
            const buttons = fixture.debugElement.queryAll(By.css('.ui-grid-action-buttons-main button'));
            expect(buttons.length).toEqual(2);
        });
    });

    describe('Behaviour: Clear custom filter', () => {
        @Component({
            template: `
                <ui-grid [data]="data"
                         [customFilterValue]="customFilter">
                    <ui-grid-header [search]="search">
                    </ui-grid-header>
                    <ui-grid-column [property]="'myNumber'"
                                    [searchable]="true"
                                    [sortable]="true"
                                    title="Number Header"
                                    width="50%">
                        <ui-grid-dropdown-filter
                        [value]="filterValue"
                        [items]="filterItems">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                    <ui-grid-column [property]="'myString'"
                                    [searchable]="true"
                                    [sortable]="true"
                                    title="String Header"
                                    width="50%">
                        <ui-grid-dropdown-filter
                        [value]="filterValue"
                        [items]="filterItems">
                        </ui-grid-dropdown-filter>
                    </ui-grid-column>
                </ui-grid>
            `,
        })
        class TestFixtureCustomFilterGridComponent {
            @ViewChild(UiGridComponent, {
                static: true,
            })
            grid!: UiGridComponent<ITestEntity>;

            get filterItems(): IDropdownOption[] {
                return [1, 2, 3].map(count => ({
                    value: count,
                    label: count.toString(),
                }));
            }
            customFilter: IFilterModel<any>[] = [];
            filterValue = {
                value: '777',
                label: 'the label',
            };
            data: ITestEntity[] = generateListFactory(generateEntity)(50);
        }

        let fixture: ComponentFixture<TestFixtureCustomFilterGridComponent>;

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    UiGridCustomPaginatorModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    UiMatPaginatorIntl,
                    {
                        provide: UI_GRID_OPTIONS,
                        useValue: {
                            useLegacyDesign: false,
                            collapseFiltersCount: 1,
                        },
                    },
                ],
                declarations: [
                    TestFixtureCustomFilterGridComponent,
                ],
            });

            fixture = TestBed.createComponent(TestFixtureCustomFilterGridComponent);

            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should show custom filter after setting the grid\'s custom filter input', () => {
            expect(document.querySelector('.ui-grid-collapsible-filters-toggle')).toBeTruthy();
            fixture.componentInstance.customFilter = [{
                property: 'myNumber1',
                method: 'eq',
                value: '2',
            }];
            fixture.detectChanges();
            expect(document.querySelector('.ui-grid-collapsible-filters-toggle')).toBeFalsy();
            expect(document.querySelector('[data-cy="clear-custom-filter"]')).toBeTruthy();
        });

        it('should revert to old filter value after clearing the custom filter', fakeAsync(() => {
            fixture.componentInstance.customFilter = [{
                property: 'myNumber2',
                method: 'eq',
                value: '2',
            }];
            fixture.detectChanges();
            expect(JSON.stringify(fixture.componentInstance.grid.filterManager.filter$.value))
                .toEqual(JSON.stringify(fixture.componentInstance.customFilter));
            expect(fixture.componentInstance.grid.filterManager.hasCustomFilter$.value).toBeTrue();

            const clearCustomFilterButton = fixture.debugElement.query(By.css('[data-cy="clear-custom-filter"]'));
            clearCustomFilterButton.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(document.querySelector('.ui-grid-collapsible-filters-toggle')).toBeTruthy();
            expect(fixture.componentInstance.grid.filterManager.hasCustomFilter$.value).toBeFalse();
            expect(fixture.componentInstance.grid.filterManager.filter$.value[0].value)
                .toEqual(fixture.componentInstance.filterValue.value);
        }));

        it('should NOT display expanded filters when grid has custom filter', fakeAsync(() => {
            fixture.detectChanges();

            const toggleFiltersButton = document.querySelector<HTMLButtonElement>('.ui-grid-collapsible-filters-toggle');
            expect(toggleFiltersButton).toBeTruthy();

            toggleFiltersButton?.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(document.querySelectorAll('.ui-grid-dropdown-filter-button').length).toBe(2);

            fixture.componentInstance.customFilter = [{
                property: 'myNumber2',
                method: 'eq',
                value: '3',
            }];

            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(document.querySelectorAll('.ui-grid-dropdown-filter-button').length).toBe(0);

            const clearCustomFilterButton = fixture.debugElement.query(By.css('[data-cy="clear-custom-filter"]'));
            clearCustomFilterButton.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
            expect(document.querySelectorAll('.ui-grid-dropdown-filter-button').length).toBe(2);
        }));

        it('should NOT display custom filter button if there are selected rows', fakeAsync(() => {
            fixture.detectChanges();
            fixture.componentInstance.customFilter = [{
                property: 'myNumber2',
                method: 'eq',
                value: '3',
            }];
            fixture.detectChanges();
            tick(500);
            let clearCustomFilterButton = fixture.debugElement.query(By.css('[data-cy="clear-custom-filter"]'));
            expect(clearCustomFilterButton).toBeTruthy();

            const checkboxInput = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell input'));
            checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            clearCustomFilterButton = fixture.debugElement.query(By.css('[data-cy="clear-custom-filter"]'));
            expect(clearCustomFilterButton).toBeFalsy();
        }));

        it('should NOT display expanded filters if grid has selection', fakeAsync(() => {
            fixture.detectChanges();

            const toggleFiltersButton = document.querySelector<HTMLButtonElement>('.ui-grid-collapsible-filters-toggle');
            toggleFiltersButton!.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(document.querySelectorAll('.ui-grid-dropdown-filter-button').length).toBe(2);

            const checkboxInput = fixture.debugElement.query(By.css('.ui-grid-header-cell.ui-grid-checkbox-cell input'));
            checkboxInput.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
            tick(500);

            expect(document.querySelectorAll('.ui-grid-dropdown-filter-button').length).toBe(0);
        }));
    });

    describe('Verify column description', () => {
        @Component({
            template: `
                <ui-grid [data]="data"
                         [customFilterValue]="customFilter">
                    <ui-grid-column [property]="'myNumber'"
                                    [sortable]="true"
                                    [description]="columnDescription"
                                    title="Number Header"
                                    width="50%">
                    </ui-grid-column>
                </ui-grid>
            `,
        })
        class TestFixtureCustomFilterGridComponent {
            columnDescription = 'some column description';
        }

        let fixture: ComponentFixture<TestFixtureCustomFilterGridComponent>;

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridModule,
                    UiGridCustomPaginatorModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    UiMatPaginatorIntl,
                    {
                        provide: UI_GRID_OPTIONS,
                        useValue: {
                            useLegacyDesign: false,
                        },
                    },
                ],
                declarations: [
                    TestFixtureCustomFilterGridComponent,
                ],
            });

            fixture = TestBed.createComponent(TestFixtureCustomFilterGridComponent);

            fixture.detectChanges();
            await fixture.whenStable();
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should display info icon and change aria label attribute of the column', fakeAsync(() => {
            fixture.detectChanges();
            expect(document.querySelector('.ui-grid-info-icon ')).toBeTruthy();
            const colTitleParagraphElement = document.querySelector('.ui-grid-header-title p');
            expect(colTitleParagraphElement!.getAttribute('aria-label')).toEqual('Number Header. some column description');
        }));

        it('should not show info icon if description is missing', fakeAsync(() => {
            fixture.componentInstance.columnDescription = '';
            fixture.detectChanges();
            expect(document.querySelector('.ui-grid-info-icon ')).toBeNull();
            const colTitleParagraphElement = document.querySelector('.ui-grid-header-title p');
            expect(colTitleParagraphElement!.getAttribute('aria-label')).toEqual('Number Header');
        }));
    });
});
