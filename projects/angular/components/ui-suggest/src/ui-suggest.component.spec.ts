import * as faker from 'faker';
import {
    a11y,
    axe,
} from 'projects/angular/axe-helper';
import { VirtualScrollItemStatus } from 'projects/angular/directives/ui-virtual-scroll-range-loader/src/public_api';
import {
    firstValueFrom,
    Observable,
    of,
} from 'rxjs';
import {
    delay,
    finalize,
    map,
    skip,
    take,
} from 'rxjs/operators';

import {
    Component,
    DebugElement,
    Directive,
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
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

import { range } from 'lodash';
import {
    ISuggestValue,
    ISuggestValues,
} from './models';
import {
    generateSuggestionItem,
    generateSuggetionItemList,
    UiSuggestAssert,
} from './test';
import { UiSuggestComponent } from './ui-suggest.component';
import { UiSuggestModule } from './ui-suggest.module';

type SuggestProperties = 'disabled' | 'readonly';

const SEARCH_DEBOUNCE = 300 + 100;
const VIRTUAL_SCROLL_DEBOUNCE = 100 + 100;
@Directive()
class UiSuggestFixtureDirective {
    @ViewChild(UiSuggestComponent, {
        static: true,
    })
    uiSuggest!: UiSuggestComponent;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    defaultValue?: string = 'All';
    placeholder = 'My Field';

    clearable?: boolean;
    searchable?: boolean;
    compact?: boolean;
    useCompactTemplate = true;
    searchableCountInfo?: { count: number; message: string };
    alwaysExpanded?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    drillDown?: boolean;
    readonly?: boolean;
    enableCustomValue?: boolean;
    items?: ISuggestValue[];
    headerItems?: ISuggestValue[];
    displayTemplateValue?: boolean;
    direction: 'up' | 'down' = 'down';
    displayPriority: 'default' | 'selected' = 'default';
    fetchStrategy: 'eager' | 'onOpen' = 'eager';
    searchSourceStrategy: 'default' | 'lazy' = 'default';
    minChars = 0;

    displayValueFactory?: (value: ISuggestValue[]) => string;

    set value(value: ISuggestValue[] | undefined) {
        this._value = value;
    }

    get value(): ISuggestValue[] | undefined {
        return this._value;
    }

    private _value?: ISuggestValue[];
}

const getNativeElement = <T = HTMLElement>(debugElement: DebugElement) => debugElement.nativeElement as T;

const getDisplayElement = (fixture: ComponentFixture<UiSuggestFixtureDirective>) => fixture.debugElement
    .query(By.css(
        fixture.componentInstance.multiple
            ? '.mat-chip-list'
            : '.display',
    ));

const searchFor = (value: string, fixture: ComponentFixture<UiSuggestFixtureDirective>) => {
    const display = getDisplayElement(fixture);
    display.nativeElement.dispatchEvent(EventGenerator.click);

    fixture.detectChanges();

    populateSearchFor(value, fixture);
};

const populateSearchFor = (value: string, fixture: ComponentFixture<UiSuggestFixtureDirective>) => {
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(EventGenerator.input());

    fixture.detectChanges();
};

const sharedSpecifications = (
    beforeEachFn: () => {
        fixture: ComponentFixture<UiSuggestFixtureDirective>;
        component: UiSuggestFixtureDirective;
        uiSuggest: UiSuggestComponent;
    },
) => {
    let fixture: ComponentFixture<UiSuggestFixtureDirective>;
    let component: UiSuggestFixtureDirective;
    let uiSuggest: UiSuggestComponent;
    let assert: UiSuggestAssert;

    beforeEach(() => {
        const setup = beforeEachFn();
        fixture = setup.fixture;
        component = setup.component;
        uiSuggest = setup.uiSuggest;
        assert = new UiSuggestAssert(fixture.debugElement, uiSuggest);
    });

    describe('Behavior: standard usage', () => {
        it('should be initialized', () => {
            expect(uiSuggest).toBeDefined();
        });

        a11y.suite((runOptions) => {
            a11y.it('should have no violations', async () => {
                fixture.detectChanges();
                expect(await axe(fixture.nativeElement, runOptions)).toHaveNoViolations();
            });
        });

        it('should throw error when enableCustomValue is used with minChars', () => {
            const error = new Error('enableCustomValue should not be used with minChars');
            component.minChars = 3;
            component.enableCustomValue = true;

            expect(() => {
                fixture.detectChanges();
            }).toThrow(error);
        });

        it('should have value set to an empty array if NULL or Undefined is provided', () => {
            component.value = undefined;

            fixture.detectChanges();

            expect(uiSuggest.value instanceof Array).toBeTruthy();
        });

        it('should display the provided placeholder and default value', () => {
            fixture.detectChanges();

            const displayContainer = fixture.debugElement.query(By.css('.display-container'));
            const displayValue = displayContainer.query(By.css('.display-value'));

            if (!uiSuggest.isFormControl) {
                const displayTitle = displayContainer.query(By.css('.display-title'));
                expect(displayTitle.nativeElement.innerText.trim()).toEqual(`${component.placeholder}:`);
            } else {
                const displayTitle = fixture.debugElement.query(By.css('.mat-form-field-label'));
                expect(displayTitle.nativeElement.innerText.trim()).toEqual(component.placeholder);
            }

            expect(displayValue.nativeElement.innerText.trim()).toEqual(component.defaultValue);
        });

        it('should remove NULL or Undefined entries', () => {
            const item = generateSuggestionItem();
            component.value = [undefined, null, null, undefined, item, null, undefined] as ISuggestValue[];

            fixture.detectChanges();

            expect(uiSuggest.value.length).toEqual(1);
            expect(uiSuggest.value).toEqual([item]);
        });

        it('should display the dropdown arrow if NOT clearable and has no items', () => {
            component.clearable = false;
            component.items = generateSuggetionItemList();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            const displayIcon = display.query(By.css('.mat-icon'));

            expect(displayIcon.nativeElement.innerText.trim()).toEqual('keyboard_arrow_down');
        });

        it('should display the dropdown arrow if it is NOT clearable and has a selected item', () => {
            const items = generateSuggetionItemList();

            component.clearable = false;
            component.items = items;
            component.value = [faker.helpers.randomize(items)];

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            const displayIcon = display.query(By.css('.mat-icon'));

            expect(displayIcon.nativeElement.innerText.trim()).toEqual('keyboard_arrow_down');
        });

        it('should display the clear icon if clearable and has a selected item', () => {
            const items = generateSuggetionItemList();

            component.clearable = true;
            component.items = items;
            component.value = [faker.helpers.randomize(items)];

            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            const clearIcon = display.query(By.css('.mat-icon.clear'));
            const displayIcon = display.query(By.css('.mat-icon:not(.clear)'));

            expect(clearIcon).toBeDefined();
            expect(clearIcon.nativeElement).toBeDefined();
            expect(displayIcon).toBeNull();
        });

        it('should have an input if searchable', () => {
            component.searchable = true;

            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input'));

            expect(input).not.toBeNull();
        });

        it('should display a list item with the noResultsPlaceholder if searchable and empty', waitForAsync(async () => {
            component.searchable = true;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();

            await fixture.whenStable();

            const noresults = fixture.debugElement.query(By.css('.no-results-text'));

            expect(!!noresults).toEqual(true);
        }));

        it('should render the list before the input if the direction is up', () => {
            component.searchable = true;
            component.direction = 'up';

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();

            const inputContainer = fixture.debugElement.query(By.css('ui-suggest .mat-form-field'));
            const previousSibling = inputContainer.nativeElement.previousElementSibling;

            expect(previousSibling).not.toBeNull();
            expect(previousSibling.tagName).toEqual('MAT-LIST');
        });

        it('should NOT render the list before it is clicked', () => {
            component.items = generateSuggetionItemList();

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(0);
        });

        it('should render the list open and not close on selection if alwaysExpanded is true', (fakeAsync(() => {
            const items = generateSuggetionItemList(10);

            component.alwaysExpanded = true;
            component.items = items;

            fixture.detectChanges();
            tick(400);

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(items.length);

            const itemIndex = Math.floor(Math.random() * items.length);
            const currentListItem = fixture.debugElement.queryAll(
                By.css('.mat-list-item'),
            )[itemIndex];

            currentListItem.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
            tick(400);

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(items.length);
        })));

        it('should filter items if typed into', (done) => {
            let items = generateSuggetionItemList(40);
            const filteredItem: ISuggestValue = {
                id: faker.random.alphaNumeric(6),
                text: faker.random.alphaNumeric(6),
            };
            const itemDup: ISuggestValue = {
                id: `${filteredItem.id} Dup`,
                text: `${filteredItem.text} Dup`,
            };
            const filteredItems = [filteredItem, itemDup];

            items = [...items, ...filteredItems];

            items = faker.helpers.shuffle(items);

            uiSuggest.sourceUpdated
                .pipe(
                    // skip initial value emission
                    // (this is an in memory search and it starts with the set values)
                    skip(1),
                    take(1),
                    finalize(done),
                )
                .subscribe((result: ISuggestValue[]) => {
                    expect(uiSuggest.items.length).toEqual(filteredItems.length);

                    for (const item of result) {
                        expect(filteredItems.findIndex(i => i.id === item.id)).toBeGreaterThanOrEqual(0);
                    }
                });

            component.searchable = true;
            component.items = items;

            fixture.detectChanges();

            expect(component.items.length).toEqual(items.length);

            searchFor(filteredItem.text, fixture);
        });

        it('should emit initialization event ONLY ONCE when the source is first queried', (done) => {
            component.items = generateSuggetionItemList('random');
            component.searchable = true;

            uiSuggest.sourceInitialized
                // by not adding any precondifion we also check that the stream completes after the first emission
                .pipe(finalize(done))
                .subscribe(items => expect(items.length).toEqual(component.items!.length));

            fixture.detectChanges();
        });

        it('should emit update event EVERY TIME the source queried', (done) => {
            const items = generateSuggetionItemList(25);

            component.searchable = true;
            component.items = items;

            uiSuggest.sourceUpdated
                .pipe(
                    take(1),
                )
                .subscribe(result => {
                    expect(result.length).toEqual(uiSuggest.items.length);
                    expect(uiSuggest.sourceInitialized.closed).toBeFalsy();
                    setTimeout(() => searchFor(faker.helpers.randomize(items).text, fixture), 100);
                });

            uiSuggest.sourceUpdated
                .pipe(
                    skip(1),
                    take(1),
                ).subscribe(result => {
                    expect(result.length).toEqual(1);
                    setTimeout(() => searchFor('', fixture), 100);
                });

            uiSuggest.sourceUpdated
                .pipe(
                    skip(2),
                    take(1),
                    finalize(done),
                ).subscribe(result => {
                    expect(result.length).toEqual(uiSuggest.items.length);
                    done();
                });

            fixture.detectChanges();
        });

        it('should emit selected on select item', async (done) => {
            const items = generateSuggetionItemList();

            component.searchable = true;
            component.clearable = true;
            component.items = items;

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));

            uiSuggest
                .selected
                .pipe(
                    take(1),
                    finalize(done),
                )
                .subscribe(item => expect(item.text).toEqual(items[0].text));

            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );
            fixture.detectChanges();

            await fixture.whenStable();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );
            fixture.detectChanges();
        });

        it('should emit selected on clear', (done) => {
            const items = generateSuggetionItemList();

            component.searchable = true;
            component.clearable = true;
            component.items = items;
            component.value = [faker.helpers.randomize(items)];

            fixture.detectChanges();

            uiSuggest
                .selected
                .pipe(
                    take(1),
                    finalize(done),
                )
                .subscribe(item => expect(item).toBeUndefined());

            const display = fixture.debugElement.query(By.css('.display'));
            const clearIcon = display.query(By.css('.mat-icon.clear'));
            clearIcon.nativeElement.dispatchEvent(EventGenerator.click);
        });

        it('should emit deselected on clear', (done) => {
            const items = generateSuggetionItemList('random');
            const selected = faker.helpers.randomize(items);

            component.searchable = true;
            component.clearable = true;
            component.items = items;
            component.value = [selected];

            fixture.detectChanges();

            uiSuggest.deselected
                .pipe(
                    take(1),
                    finalize(done),
                )
                .subscribe(item => expect(item.text).toEqual(selected.text));

            const display = fixture.debugElement.query(By.css('.display'));
            const clearIcon = display.query(By.css('.mat-icon.clear'));
            clearIcon.nativeElement.dispatchEvent(EventGenerator.click);
        });

        it('should display no items if the source throws an error', waitForAsync(async () => {
            const items = generateSuggetionItemList('random');

            component.searchable = true;
            component.items = items;
            uiSuggest.searchSourceFactory = () => of([...items]).pipe(
                map(() => {
                    throw new Error('Testing if all goes well');
                }),
            );

            await fixture.whenStable();

            expect(uiSuggest.loading).toBeFalsy();
            expect(uiSuggest.value.length).toEqual(0);
        }));

        it('should query ONLY ONCE if spammed', (done) => {
            const items = generateSuggetionItemList('random');

            component.searchable = true;
            component.items = items;

            fixture.detectChanges();

            uiSuggest.searchSourceFactory = (term) => of([...items]).pipe(
                delay(100),
                map(itemList => ({
                    data: itemList.filter(item => item.text.includes(term as string)),
                    total: itemList.length,
                }) as ISuggestValues<any>),
            );

            uiSuggest.sourceUpdated
                .pipe(
                    take(1),
                    finalize(done),
                )
                .subscribe(result => expect(result.length).toEqual(items.length));

            for (const item of items) {
                searchFor(item.text, fixture);
            }

            searchFor('', fixture);
        });

        (['disabled', 'readonly'] as SuggestProperties[]).forEach((state: SuggestProperties) => {
            it(`should close list if ${state} is set to false`, () => {
                component.items = generateSuggetionItemList();
                component[state] = false;

                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));

                display.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                assert.isOpen();

                component[state] = true;

                fixture.detectChanges();

                assert.isClosed();
            });

            it(`should not open if the component is ${state}`, () => {
                component[state] = true;

                fixture.detectChanges();

                assert.isClosed();

                fixture.detectChanges();
                const display = fixture.debugElement.query(By.css('.display'));

                display.nativeElement.dispatchEvent(EventGenerator.click);

                assert.isClosed();
            });
        });

        describe('Scenario: toggle disabled state', () => {
            it('should toggle loading state if it is searchable with items', () => {
                const items = generateSuggetionItemList();
                component.items = items;
                component.disabled = true;
                component.searchable = true;

                fixture.detectChanges();

                assert.isDisabled();
                expect(uiSuggest.loading$.value).toBeFalsy();

                component.disabled = false;
                fixture.detectChanges();

                assert.isEnabled();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                expect(uiSuggest.loading$.value).toBeFalsy();
            });

            it('should not be in loading state if it has a searchSourceFactory', async () => {
                const items = generateSuggetionItemList();
                component.disabled = true;
                uiSuggest.searchSourceFactory = (term) => of([...items]).pipe(
                    map(itemList => ({
                        data: itemList.filter(item => item.text.includes(term as string)),
                        total: itemList.length,
                    }) as ISuggestValues<any>),
                );

                fixture.detectChanges();
                assert.isDisabled();

                component.disabled = false;
                fixture.detectChanges();
                assert.isEnabled();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                await fixture.whenStable();

                expect(uiSuggest.loading$.value).toBeFalsy();
            });
        });

        it('should not open on first click and close on the second', () => {
            fixture.detectChanges();

            assert.isClosed();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));

            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();

            assert.isOpen();

            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();

            assert.isClosed();
        });
    });

    describe('Behavior: a11y on open', () => {
        it(`should announce if empty`, waitForAsync(async () => {
            fixture.detectChanges();

            const spy = spyOn((uiSuggest as any)._liveAnnouncer, 'announce');
            const display = fixture.debugElement.query(By.css(
                fixture.componentInstance.multiple
                    ? '.mat-chip-list'
                    : '[role=combobox]'),
            );

            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith('No results');
        }));

        it(`should NOT annuonce a highlight if in loading state`, () => {
            component.items = generateSuggetionItemList('random');
            fixture.detectChanges();

            const spy = spyOn((uiSuggest as any)._liveAnnouncer, 'announce');
            uiSuggest.loading$.next(true);

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();
            expect(spy).toHaveBeenCalledTimes(0);
        });

        it(`should announce as highlighted first item`, () => {
            component.items = generateSuggetionItemList('random');
            fixture.detectChanges();

            const spy = spyOn((uiSuggest as any)._liveAnnouncer, 'announce');
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();
            expect(spy).toHaveBeenCalledWith(`${component.items[0].text} item 1 out of ${component.items.length}`);
        });
    });

    describe('Behavior: keyboard navigation', () => {
        let items: ISuggestValue[];

        beforeEach(() => {
            items = generateSuggetionItemList(25);
            component.items = items;
        });

        it('should have active index 0 initially if no items are selected and no custom value', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            expect(uiSuggest.activeIndex).toEqual(0);
        });

        it('should open when pressing Enter', () => {
            fixture.detectChanges();

            assert.isClosed();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            assert.isOpen();
        });

        it('should open when pressing Space', () => {
            fixture.detectChanges();

            assert.isClosed();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyUp(Key.Space),
            );

            fixture.detectChanges();

            assert.isOpen();
        });

        it('should have the active index set when opened', () => {
            component.value = [faker.helpers.randomize(items)];

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const [item] = uiSuggest.value;
            expect(uiSuggest.activeIndex).toBe(uiSuggest.items.findIndex(value => value.id === item.id));
        });

        it('should increment positively if DIRECTION is DOWN and NAVIGATING DOWN', () => {
            component.direction = 'down';

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            expect(uiSuggest.activeIndex).toEqual(1);
        });

        it('should increment positively if DIRECTION is DOWN and NAVIGATING UP', () => {
            component.direction = 'down';

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowUp),
            );

            expect(uiSuggest.activeIndex).toEqual(items.length - 1);
        });

        it('should increment negatively if DIRECTION is UP and NAVIGATING UP', () => {
            component.direction = 'up';

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowUp),
            );

            expect(uiSuggest.activeIndex).toEqual(items.length - 2);
        });

        it('should increment positively if DIRECTION is UP and NAVIGATING DOWN', () => {
            component.direction = 'up';

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            expect(uiSuggest.activeIndex).toEqual(0);
        });

        it('should set index to zero if no items are available', () => {
            component.items = [];

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            expect(uiSuggest.activeIndex).toEqual(0);
        });

        it('should select the active item when pressing enter', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            const randomBoundItem = faker.helpers.randomize(items.slice(0, items.length - 2));
            const keyDownPresses = items.indexOf(randomBoundItem) + 1;
            const expectedIndex = keyDownPresses;

            for (let i = 0; i < keyDownPresses; i++) {
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowDown),
                );
            }
            expect(uiSuggest.value.length).toEqual(0);

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            expect(uiSuggest.value.length).toEqual(1);
            expect(uiSuggest.value[0].id).toEqual(items[expectedIndex].id);
            expect(uiSuggest.value[0].text).toEqual(items[expectedIndex].text);
        });

        it('should have circular active index (reset to first if reached the end)', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            const keyDownPresses = items.length + 1;

            expect(uiSuggest.activeIndex).toEqual(0);

            for (let i = 1; i < keyDownPresses; i++) {
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowDown),
                );
                expect(uiSuggest.activeIndex).toEqual(i < items.length ? i : 0);
            }
        });

        it('should close if selecting an item via navigation and multiple selection is DISABLED', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            assert.isOpen();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            assert.isClosed();
        });

        it('should NOT close if selecting an item via navigation and multiple selection is ENABLED', () => {
            component.multiple = true;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();
            assert.isOpen();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            assert.isOpen();
        });

        it('should close if Tab is pressed', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            assert.isOpen();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Tab),
            );

            fixture.detectChanges();

            assert.isClosed();
        });

        it('should close if Shift + Tab is pressed', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            assert.isOpen();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Tab, Key.Shift),
            );

            fixture.detectChanges();

            assert.isClosed();
        });

        it('should close if Esc is pressed', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            assert.isOpen();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyUp(Key.Escape),
            );

            fixture.detectChanges();

            assert.isClosed();
        });

        it('should clear selection if Esc is pressed', () => {
            component.clearable = true;
            component.value = [faker.helpers.randomize(items)];

            fixture.detectChanges();

            expect(uiSuggest.value.length).toEqual(1);

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyUp(Key.Escape),
            );
            fixture.detectChanges();

            expect(uiSuggest.value.length).toEqual(0);
        });
    });

    describe('Behavior: multi-select chips', () => {
        beforeEach(() => {
            component.items = generateSuggetionItemList('random');
            component.multiple = true;
            component.defaultValue = undefined;
        });

        describe('a11y', () => {
            a11y.suite((runOptions) => {
                a11y.it('should have no violations', async () => {
                    component.searchable = true;

                    fixture.detectChanges();
                    expect(await axe(fixture.nativeElement, runOptions)).toHaveNoViolations();
                });
            });

            it(`should announce if empty`, waitForAsync(async () => {
                component.items = [];
                fixture.detectChanges();

                const spy = spyOn((uiSuggest as any)._liveAnnouncer, 'announce');
                const display = fixture.debugElement.query(By.css(
                    fixture.componentInstance.multiple
                        ? '.mat-chip-list'
                        : '[role=combobox]'),
                );

                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                await fixture.whenStable();
                fixture.detectChanges();

                expect(spy).toHaveBeenCalledWith('No results');
            }));

            it(`should NOT annuonce a highlight if in loading state`, () => {
                component.items = generateSuggetionItemList('random');
                fixture.detectChanges();

                const spy = spyOn((uiSuggest as any)._liveAnnouncer, 'announce');
                uiSuggest.loading$.next(true);

                const display = fixture.debugElement.query(By.css('.mat-chip-list'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                expect(spy).toHaveBeenCalledTimes(0);
            });

            it(`should announce as highlighted first item`, () => {
                component.items = generateSuggetionItemList('random');
                fixture.detectChanges();

                const spy = spyOn((uiSuggest as any)._liveAnnouncer, 'announce');
                const display = fixture.debugElement.query(By.css('.mat-chip-list'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                expect(spy).toHaveBeenCalledWith(`${component.items[0].text} item 1 out of ${component.items.length}`);
            });
        });

        describe('With custom', () => {
            function addByClickCustomValue(str: string) {
                searchFor(str, fixture);
                fixture.detectChanges();
                tick(5000);

                fixture.debugElement.query(By.css('.custom-item')).nativeElement
                    .dispatchEvent(EventGenerator.click);
                fixture.detectChanges();
            }

            function addCustomValue(str: string) {
                searchFor(str, fixture);
                fixture.detectChanges();
                tick(5000);

                const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.Enter),
                );
                fixture.detectChanges();
            }

            beforeEach(async () => {
                component.searchable = true;
                component.enableCustomValue = true;

                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.mat-chip-list'));
                display.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.Enter),
                );

                fixture.detectChanges();
                await fixture.whenStable();
            });

            it('should be able to toggle a custom value', fakeAsync(() => {
                addCustomValue('A');

                expect(uiSuggest.value[0].text).toBe('A');
                const chip = fixture.debugElement.query(By.css('.mat-chip.mat-standard-chip span'));

                expect(chip.nativeNode.innerText).toBe('A');

                fixture.debugElement.query(By.css('.mat-chip.mat-standard-chip .mat-chip-remove'))
                    .nativeElement
                    .dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                expect(uiSuggest.value.length).toBe(0);

                expect(fixture.debugElement.query(By.css('.mat-chip.mat-standard-chip span'))).toBeFalsy();

                discardPeriodicTasks();
            }));

            it('should render info message when the value in input is already selected', fakeAsync(() => {
                addCustomValue('A');
                searchFor('A', fixture);
                fixture.detectChanges();
                tick(5000);

                const itemContainerText = fixture.debugElement.query(By.css('.custom-item .text-label-rendered'));
                expect(itemContainerText.nativeElement.innerText).toEqual('This item is already added.');

                discardPeriodicTasks();
            }));

            it('should be able to add multiple custom values', fakeAsync(() => {
                addCustomValue('A');
                addCustomValue('B');
                addCustomValue('C');

                const chips = fixture.debugElement.queryAll(By.css('.mat-chip.mat-standard-chip span')).map(el => el.nativeNode.innerText);
                tick(1000);

                expect(`${chips}`).toEqual(`A,B,C`);
            }));

            it('should preserve input focus on click custom value', fakeAsync(() => {
                const input = fixture.debugElement.query(By.css('.mat-chip-list input'));
                addByClickCustomValue('A');
                tick(1000);
                expect(document.activeElement).toBe(input.nativeElement);
            }));

            it('should NOT add custom value on close if input is populated', fakeAsync(() => {
                searchFor('test', fixture);
                fixture.detectChanges();
                tick(5000);
                expect(uiSuggest.inputControl.value).toEqual('test');

                uiSuggest.close();
                fixture.detectChanges();
                tick(1000);

                expect(uiSuggest.value).toEqual([]);
            }));

            it('should clear input after selection', fakeAsync(() => {
                addCustomValue('A');
                tick(1000);

                const input: HTMLInputElement = fixture.debugElement.query(By.css('input'))!.nativeElement;
                expect(uiSuggest.inputControl.value).toEqual('');
                expect(input.value).toEqual('');
            }));

        });

        describe('generic', () => {
            it('should update chiplist on new item selected', fakeAsync(() => {
                const someAvailableItems = component.items!.slice(0, 4);
                const initiallySelectedItems = someAvailableItems.slice(0, 3);
                component.value = initiallySelectedItems;
                fixture.detectChanges();
                tick();

                const initialChips = fixture.debugElement.queryAll(By.css('.mat-chip'));
                expect(initialChips.length).toBe(3);

                fixture.detectChanges();
                tick(5000);

                searchFor(component.items![3].text, fixture);
                fixture.detectChanges();
                tick(5000);

                const currentListItem = fixture.debugElement.queryAll(
                    By.css('.mat-list-item'),
                )[3];

                currentListItem.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                tick(5000);

                const updatedChips = fixture.debugElement
                    .queryAll(By.css('.mat-chip span'))
                    .map(el => getNativeElement<HTMLSpanElement>(el));

                expect(updatedChips.length).toEqual(4);
                expect(updatedChips.map(chip => chip.innerText)).toEqual(someAvailableItems.map(item => item.text));

                discardPeriodicTasks();
            }));

            it('should NOT react to keyup space coming from chips', fakeAsync(() => {
                component.searchable = true;

                fixture.detectChanges();
                tick();
                const display = getDisplayElement(fixture);
                display.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                tick(5000);

                const chips = fixture.debugElement.query(By.css('.mat-chip-list'));
                chips.nativeElement.dispatchEvent(EventGenerator.keyUp(Key.Space));

                fixture.detectChanges();
                discardPeriodicTasks();
                expect(uiSuggest.value).toEqual([]);
            }));

            it('should list initial value in correct order', fakeAsync(() => {
                const items = component.items!.slice(0, 3);
                component.value = items;
                fixture.detectChanges();
                tick(5000);

                const chips = fixture.debugElement.queryAll(By.css('.mat-chip span')).map(el => getNativeElement<HTMLSpanElement>(el));

                expect(chips.length).toEqual(3);
                expect(chips.map(chip => chip.innerText)).toEqual(items.map(item => item.text));
                discardPeriodicTasks();
            }));

            it('should be able to remove chip from remove button', fakeAsync(() => {
                const items = component.items!.slice(0, 3);
                component.value = items;
                fixture.detectChanges();
                tick();

                const initialChips = fixture.debugElement.queryAll(By.css('.mat-chip'));
                expect(initialChips.length).toBe(3);

                const chipRemoveButton = getNativeElement<HTMLButtonElement>(initialChips[1].query(By.css('button')));
                chipRemoveButton.click();

                fixture.detectChanges();
                tick(5000);

                const updatedChips = fixture.debugElement
                    .queryAll(By.css('.mat-chip span'))
                    .map(el => getNativeElement<HTMLSpanElement>(el));

                expect(updatedChips.length).toEqual(2);
                expect(updatedChips.map(chip => chip.innerText)).toEqual([items[0].text, items[2].text]);

                discardPeriodicTasks();
            }));

            it('should NOT be able to remove chip if readonly', fakeAsync(() => {
                const items = component.items!.slice(0, 3);
                component.value = items;
                component.readonly = true;
                fixture.detectChanges();
                tick();

                const initialChips = fixture.debugElement.queryAll(By.css('.mat-chip'));
                expect(initialChips.length).toBe(3);

                const chipRemoveButton = getNativeElement<HTMLButtonElement>(initialChips[1].query(By.css('button')));
                chipRemoveButton.click();

                fixture.detectChanges();
                tick(5000);

                const updatedChips = fixture.debugElement
                    .queryAll(By.css('.mat-chip span'))
                    .map(el => getNativeElement<HTMLSpanElement>(el));

                expect(updatedChips.length).toEqual(3);
                expect(updatedChips.map(chip => chip.innerText)).toEqual(items.map(item => item.text));

                discardPeriodicTasks();
            }));
        });
    });

    describe('Behavior: headerItems', () => {
        it('should not work with custom value enabled', () => {
            const error = new Error('enableCustomValue and headerItems are mutually exclusive options');
            component.enableCustomValue = true;

            expect(() => {
                component.headerItems = generateSuggetionItemList(5);
                fixture.detectChanges();
            }).toThrow(error);
        });

        it('should not work with custom direction up', () => {
            const error = new Error('direction up is not supported when used in conjunction with headerItems');
            component.direction = 'up';

            expect(() => {
                component.headerItems = generateSuggetionItemList(5);
                fixture.detectChanges();
            }).toThrow(error);
        });

        it('should display header items & fetched data in list', fakeAsync(() => {
            const items = generateSuggetionItemList(10);
            const headerItems = items.slice(0, 5);
            const regularItems = items.slice(5, 10);

            component.alwaysExpanded = true;
            component.items = regularItems;
            component.headerItems = headerItems;

            fixture.detectChanges();
            tick(1000);

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(items.length);
            itemListEntries.forEach((entry, idx) => {
                expect(entry.nativeElement.innerText).toBe(items[idx].text);
            });
        }));

        it('should hide elements on search', fakeAsync(() => {
            const items = generateSuggetionItemList(10, 'Item');
            const headerItems = items.slice(0, 5);
            const regularItems = items.slice(5, 10);

            component.alwaysExpanded = true;
            component.items = regularItems;
            component.headerItems = headerItems;
            component.searchable = true;

            fixture.detectChanges();
            tick(1000);

            searchFor('Item', fixture);

            fixture.detectChanges();
            tick(1000);

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(regularItems.length);
            itemListEntries.forEach((entry, idx) => {
                expect(entry.nativeElement.innerText).toBe(regularItems[idx].text);
            });
        }));

        it('should render headerItems when searchSourceFactory is empty', fakeAsync(() => {
            const headerItems = generateSuggetionItemList(1, 'Item');
            const regularItems = [] as ISuggestValue[];

            component.alwaysExpanded = true;
            component.items = regularItems;
            component.headerItems = headerItems;
            component.searchable = true;

            fixture.detectChanges();
            tick(1000);

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(1);

            const [item] = itemListEntries;

            expect(item.nativeElement.innerText).toBe(headerItems[0].text);
        }));
    });

    describe('Selection: single value', () => {
        it('should have one list item entry for each item provided', waitForAsync(async () => {
            fixture.detectChanges();
            component.items = generateSuggetionItemList(10);
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));
            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toBe(component.items.length);
        }));

        it('should display the item text instead of the default value if selected', () => {
            component.items = generateSuggetionItemList(10);
            const selectedItem = faker.helpers.randomize(component.items);
            component.value = [selectedItem];

            fixture.detectChanges();

            const displayContainer = fixture.debugElement.query(By.css('.display-container'));
            const displayValue = displayContainer.query(By.css('.display-value'));

            if (!uiSuggest.isFormControl) {
                const displayTitle = displayContainer.query(By.css('.display-title'));
                expect(displayTitle.nativeElement.innerText.trim()).toBe(`${component.placeholder}:`);
            } else {
                const displayTitle = fixture.debugElement.query(By.css('.mat-form-field-label'));
                expect(displayTitle.nativeElement.innerText.trim()).toEqual(component.placeholder);
            }

            expect(displayValue.nativeElement.innerText.trim()).toBe(selectedItem.text);
        });

        it('should set the selected item from the list as active when clicked', waitForAsync(async () => {
            component.items = generateSuggetionItemList(10);
            const randomItem = faker.helpers.randomize(component.items);
            const randomIdx = component.items.indexOf(randomItem);
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();

            const randomListItem = fixture.debugElement.queryAll(
                By.css('.mat-list-item'),
            )[randomIdx];

            randomListItem.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(uiSuggest.value.length).toBe(1);
            expect(uiSuggest.value[0].id).toEqual(randomItem.id);
            expect(uiSuggest.value[0].text).toEqual(randomItem.text);
        }));

        it('should clear the selected value if the clear button is pressed', () => {
            component.clearable = true;
            component.items = generateSuggetionItemList('random');
            const selectedItem = faker.helpers.randomize(component.items);
            component.value = [selectedItem];

            fixture.detectChanges();

            expect(uiSuggest.value.length).toBe(1);

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            const clearIcon = display.query(By.css('.mat-icon.clear'));

            clearIcon.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(uiSuggest.value.length).toBe(0);
        });

        it('should replace the current value if selecting a new one', waitForAsync(async () => {
            component.items = generateSuggetionItemList(10);
            component.value = [];
            component.defaultValue = undefined;

            fixture.detectChanges();

            for (let i = 0; i < component.items.length; i++) {
                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                await fixture.whenStable();

                const currentItem = component.items[i];
                const currentListItem = fixture.debugElement.queryAll(
                    By.css('.mat-list-item'),
                )[i];
                currentListItem.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const displayContainer = fixture.debugElement.query(By.css('.display-container'));
                const displayValue = displayContainer.query(By.css('.display-value'));

                if (!uiSuggest.isFormControl) {
                    const displayTitle = displayContainer.query(By.css('.display-title'));
                    expect(displayTitle.nativeElement.innerText.trim()).toBe(`${component.placeholder}:`);
                } else {
                    const displayTitle = fixture.debugElement.query(By.css('.mat-form-field-label'));
                    expect(displayTitle.nativeElement.innerText.trim()).toEqual(component.placeholder);
                }

                expect(displayValue.nativeElement.innerText.trim()).toBe(currentItem.text);
            }
        }));

        describe('Feature: custom value', () => {
            let items: ISuggestValue[];

            beforeEach(() => {
                items = generateSuggetionItemList('random');
                component.searchable = true;
                component.enableCustomValue = true;
                component.items = items;
            });

            it('should append the value to the list if there is no full match', waitForAsync(async () => {
                fixture.detectChanges();

                searchFor(faker.random.uuid(), fixture);

                await fixture.whenStable();

                const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));
                expect(itemList.length).toEqual(1);

                const [customItem] = itemList;
                expect(customItem.nativeElement.classList.contains('active')).toBe(true);

                const icon = customItem.query(By.css('mat-icon'));
                expect(icon).toBeTruthy();
            }));

            it('should be active if partial matches exist', waitForAsync(async () => {
                fixture.detectChanges();

                const [longestTextItem] = component.items!.slice()
                    .sort((a, b) => b.text.length - a.text.length);
                const partial = longestTextItem.text.substring(0, longestTextItem.text.length - 1);

                searchFor(partial, fixture);
                await fixture.whenStable();

                const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));
                expect(itemList.length).toEqual(2);

                const customItem = fixture.debugElement.query(By.css('.custom-item'));

                expect(customItem.nativeElement.classList.contains('active')).toBe(true);

                const icon = customItem.query(By.css('mat-icon'));
                expect(icon).toBeTruthy();
            }));

            it('should have the custom text match the input value if reopened', waitForAsync(async () => {
                fixture.detectChanges();

                const word = faker.random.uuid();
                searchFor(word, fixture);
                await fixture.whenStable();

                const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));
                expect(itemList.length).toBe(1);

                const [customItem] = itemList;

                customItem.nativeElement.dispatchEvent(EventGenerator.click);

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                expect(uiSuggest.inputControl.value).toBe(word);
            }));

            it('should trim the text when added', waitForAsync(async () => {
                fixture.detectChanges();

                const word = faker.random.word();
                const wordWithWhitespace = `${Array(6).fill(' ').join('')
                    }${word}${Array(6).fill(' ').join('')
                    }`;

                searchFor(wordWithWhitespace, fixture);
                await fixture.whenStable();

                const customItem = fixture.debugElement.query(By.css('.custom-item'));
                customItem.nativeElement.dispatchEvent(EventGenerator.click);
                expect(uiSuggest.value[0].text).toBe(word);
            }));
        });
    });

    describe('Selection: multi value', () => {
        beforeEach(() => {
            component.items = generateSuggetionItemList('random');
            component.multiple = true;
            component.defaultValue = 'test';
        });

        it('should display all selected values', () => {
            const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
            component.searchable = true;
            component.value = selectedValues;

            fixture.detectChanges();

            const chipsContainer = fixture.debugElement.query(By.css('.mat-chip-list'));
            const selectedChips = chipsContainer.queryAll(By.css('.mat-chip'));

            if (!uiSuggest.isFormControl) {
                const displayTitle = fixture.debugElement.query(By.css('.mat-chip-list input'));
                const nativeDisplayTitle = getNativeElement<HTMLInputElement>(displayTitle);
                expect(nativeDisplayTitle.getAttribute('placeholder')).toEqual(component.defaultValue ?? null);
            } else {
                const displayTitle = fixture.debugElement.query(By.css('.mat-form-field-label'));
                expect(displayTitle.nativeElement.innerText.trim()).toEqual(component.placeholder);
            }

            const selectedChipsInnerText = selectedChips
                .map(chip => chip.query(By.css('span')).nativeElement as HTMLSpanElement)
                .map(chipSpan => chipSpan.innerText);

            expect(selectedChipsInnerText.length).toBe(selectedValues.length);
            selectedValues
                .map(value => value.text)
                .forEach(valueText => expect(selectedChipsInnerText.includes(valueText)).toBeTrue());
        });

        it('should display all selected values in compact mode', () => {
            const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
            component.value = selectedValues;
            component.compact = true;
            component.searchable = true;

            fixture.detectChanges();

            const displayContainer = fixture.debugElement.query(By.css('.display-container'));
            const displayValue = displayContainer.query(By.css('.display-value'));

            if (!uiSuggest.isFormControl) {
                const displayTitle = displayContainer.query(By.css('.display-title'));
                expect(displayTitle.nativeElement.innerText.trim()).toBe(`${component.placeholder}:`);
            } else {
                const displayTitle = fixture.debugElement.query(By.css('.mat-form-field-label'));
                expect(displayTitle.nativeElement.innerText.trim()).toEqual(component.placeholder);
            }

            selectedValues
                .map(value => value.text)
                .forEach(valueText => expect(displayValue.nativeElement.innerText.trim()).toContain(valueText));
        });

        it('should have a checkbox next to each item entry', waitForAsync(async () => {
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();
            fixture.detectChanges();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            for (const itemEntry of itemList) {
                const checkbox = itemEntry.query(By.css('.mat-checkbox'));
                const label = itemEntry.query(By.css('.text-label'));
                expect(checkbox).not.toBeNull();
                expect(checkbox.nativeElement.nextElementSibling).toBe(label.nativeElement);
            }
        }));

        it('should have the checkbox disabled next to disabled item entry', waitForAsync(async () => {
            component.items![0].disabled = true;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();
            fixture.detectChanges();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            const itemEntry = itemList[0];
            expect(itemEntry.nativeElement).toHaveClass('disabled');
        }));

        it('should have the chechbox checked for selected items', waitForAsync(async () => {
            const selectedValues = component.items!.slice(0, 5);
            component.value = selectedValues;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();
            fixture.detectChanges();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            for (const itemEntry of itemList) {
                const label = itemEntry.query(By.css('.text-label'));
                const labelText = label.nativeElement.innerText.trim();
                if (selectedValues.find(value => value.text === labelText)) {
                    const checkbox = itemEntry.query(By.css('input:checked'));
                    expect(checkbox).not.toBeNull();
                }
            }

            const checkedCheckboxes = fixture.debugElement.queryAll(By.css('input:checked'));
            expect(checkedCheckboxes.length).toBe(selectedValues.length);
        }));

        it('should remove a selected item if clicked', waitForAsync(async () => {
            component.displayPriority = 'selected';
            const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
            component.value = selectedValues;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();
            fixture.detectChanges();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));
            const checkedItem = itemList.find(itemEntry => !!itemEntry.query(By.css('input:checked')));
            expect(checkedItem).toBeDefined();
            checkedItem!.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            const checkedCheckboxes = fixture.debugElement.queryAll(By.css('input:checked'));
            expect(checkedCheckboxes.length).toBe(selectedValues.length - 1);
            expect(uiSuggest.value.length).toBe(selectedValues.length - 1);
        }));

        it('should remove all values except the first if changed to single selection', () => {
            const selectedValues = faker.helpers.shuffle(component.items!)
                .slice(0, Math.floor(component.items!.length / 2));
            component.value = selectedValues;
            fixture.detectChanges();

            component.multiple = false;

            fixture.detectChanges();

            expect(uiSuggest.value.length).toBe(1);
            expect(uiSuggest.value[0].id).toBe(selectedValues[0].id);
            expect(uiSuggest.value[0].text).toBe(selectedValues[0].text);
        });

        it('should have selected items displayed first if display priority is set to selected', async () => {
            const items = component.items!;
            const selectedItems = [
                items[items.length - 1],
                items[items.length - 2],
            ];
            component.value = selectedItems;
            component.displayPriority = 'selected';

            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();
            fixture.detectChanges();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            const expectedSelectedItems = itemList.slice(0, component.value.length);

            expect(expectedSelectedItems.length).toBeGreaterThan(0);

            expectedSelectedItems.forEach(selectedItem => {
                const label = selectedItem.query(By.css('.text-label'));
                const labelText = label.nativeElement.innerText.trim();

                expect(selectedItems.find(x => x.text === labelText)).toBeDefined();
            });
        });

        it('should resort when display priority is set to selected and the value updates', () => {
            const items = component.items!;

            let selectedItems = [
                items[items.length - 1],
                items[items.length - 2],
            ];
            component.value = selectedItems;
            component.displayPriority = 'selected';
            fixture.detectChanges();

            expect(uiSuggest.value.length).toEqual(selectedItems.length);

            selectedItems = [
                ...component.value,
                items[items.length - 3],
            ];
            component.value = selectedItems;
            fixture.detectChanges();

            expect(uiSuggest.value.length).toEqual(selectedItems.length);

            const display = fixture.debugElement.query(By.css('.mat-chip-list'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            const expectedSelectedItems = itemList.slice(0, component.value.length);

            expectedSelectedItems.forEach(selectedItem => {
                const label = selectedItem.query(By.css('.text-label'));
                const labelText = label.nativeElement.innerText.trim();

                expect(selectedItems.find(x => x.text === labelText)).toBeDefined();
            });
        });
    });

    describe('Source: async data', () => {
        const items = generateSuggetionItemList(100);
        let overrideItems: ISuggestValue[] | undefined;

        const asyncSearchFactory = (delayTime = 0) => (query = '', fetchSize = 10, start = 0) => {
            const source = overrideItems ?? items;

            const results = query !== '' && !query.includes(':') ?
                source.filter(i => i.text.toLowerCase().includes(query.toLowerCase())) :
                [...source];

            return of(results)
                .pipe(
                    map(
                        (filteredItems) => ({
                            total: filteredItems.length,
                            data: filteredItems.slice(start, start + fetchSize),
                        } as ISuggestValues<any>),
                    ),
                    delay(delayTime),
                );
        };

        let sourceSpy: jasmine.Spy<(query: string, fetchSize: number, start: number) => Observable<ISuggestValues<any>>>;

        beforeEach(() => {
            overrideItems = undefined;
            uiSuggest.searchSourceFactory = asyncSearchFactory();
            sourceSpy = spyOn<UiSuggestComponent, any>(uiSuggest, 'searchSourceFactory');
            sourceSpy.and.callThrough();
            component.searchable = true;
            uiSuggest.displayCount = 10;
        });

        describe('Feature: Drill Down', () => {
            beforeEach(() => {
                component.drillDown = true;
                fixture.detectChanges();
            });

            it('should render as drill down', () => {
                expect(fixture.debugElement.query(By.css('ui-suggest.drill-down'))).toBeTruthy();
            });

            describe('open', () => {
                beforeEach(async () => {
                    const display = fixture.debugElement.query(By.css('.display'));
                    display.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();
                });

                it('should have requested items', () => {
                    expect(sourceSpy).toHaveBeenCalledTimes(1);
                });

                it('should render item(s) as expandable', () => {
                    expect(fixture.debugElement.queryAll(By.css('.mat-list-item.is-expandable')).length).toBeGreaterThan(0);
                });

                it('should fill in search on item select', async () => {
                    const item = fixture.debugElement.query(By.css('.mat-list-item.is-expandable'));
                    const itemText = (item.query(By.css('span.text-label-rendered')).nativeElement as HTMLElement).innerText;
                    item.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();

                    expect(sourceSpy).toHaveBeenCalledTimes(2);

                    const search = fixture.debugElement.query(By.css('ui-suggest input')).nativeElement as HTMLInputElement;

                    expect(search.value).toEqual(`${itemText}:`);
                });

                it('should be able to clear upon selection', async () => {
                    const item = fixture.debugElement.query(By.css('.mat-list-item.is-expandable'));
                    item.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();
                    expect(uiSuggest.isOpen).toBe(true);

                    const clear = fixture.debugElement.query(By.css('mat-icon.clear'));
                    clear.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();
                    expect(uiSuggest.isOpen).toBe(true);
                });

                it('should NOT have item selected if expandable', async () => {
                    const item = fixture.debugElement.query(By.css('.mat-list-item.is-expandable'));
                    item.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();
                    expect(uiSuggest.value).toEqual([]);
                });

                it('should be able to select drilled item', async () => {
                    const item = fixture.debugElement.query(By.css('.mat-list-item.is-expandable'));
                    item.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();

                    const query = uiSuggest.inputControl.value;

                    const drilled = fixture.debugElement.query(By.css('.mat-list-item:not(.is-expandable'));
                    const drilledText = (drilled.query(By.css('span')).nativeElement as HTMLElement).innerText;
                    drilled.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();

                    expect(uiSuggest.value.length).toEqual(1);
                    expect(uiSuggest.value[0].text).toEqual(`${query}${drilledText}`);
                });
            });
        });

        describe('Feature: fetchStrategy', () => {
            it('should make fetch call if fetchStrategy is `eager`', waitForAsync(async () => {
                fixture.detectChanges();
                await fixture.whenStable();

                expect(sourceSpy).toHaveBeenCalled();
            }));

            it('should not fetch if fetchStrategy is `onOpen`', waitForAsync(async () => {
                component.fetchStrategy = 'onOpen';
                fixture.detectChanges();
                await fixture.whenStable();

                expect(sourceSpy).toHaveBeenCalledTimes(0);
            }));

            it('should call fetch if fetchStrategy is `onOpen` and suggest gets opened', waitForAsync(async () => {
                component.fetchStrategy = 'onOpen';

                fixture.detectChanges();
                await fixture.whenStable();

                expect(sourceSpy).toHaveBeenCalledTimes(0);

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                await fixture.whenStable();

                expect(sourceSpy).toHaveBeenCalled();
            }));
            // FIXME: flaky test
            // eslint-disable-next-line jasmine/no-disabled-tests
            xit('should call fetch 2 times if fetchStrategy is `onOpen`, direction is `up` and suggest gets opened twice', waitForAsync(
                async () => {
                    component.fetchStrategy = 'onOpen';
                    component.direction = 'up';
                    overrideItems = new Array(6).fill(0).map((_, i) => ({
                        id: i + 1,
                        text: `Suggestion ${i + 1}`,
                    }));
                    uiSuggest.displayCount = 5;
                    uiSuggest.searchSourceFactory = asyncSearchFactory(100);
                    sourceSpy = spyOn<UiSuggestComponent, any>(uiSuggest, 'searchSourceFactory');
                    sourceSpy.and.callThrough();

                    fixture.detectChanges();
                    await fixture.whenStable();

                    expect(sourceSpy).toHaveBeenCalledTimes(0);

                    const display = fixture.debugElement.query(By.css('.display'));
                    display.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();

                    fixture.detectChanges();

                    expect(sourceSpy).toHaveBeenCalledTimes(2);

                    uiSuggest.close();
                    fixture.detectChanges();

                    display.nativeElement.dispatchEvent(EventGenerator.click);

                    fixture.detectChanges();
                    await fixture.whenStable();

                    fixture.detectChanges();

                    expect(sourceSpy).toHaveBeenCalledTimes(4);
                }));

            it(`should fetch call after the 'minChars' is met`, waitForAsync(async () => {
                const MIN_CHARS = 5;
                component.minChars = MIN_CHARS;

                fixture.detectChanges();
                await fixture.whenStable();

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;

                const typeChar = async () => {
                    searchInput.value = searchInput.value + faker.random.alphaNumeric(1);
                    searchInput.dispatchEvent(EventGenerator.input());
                    fixture.detectChanges();
                    await fixture.whenStable();
                };

                const deleteChar = async () => {
                    searchInput.value = searchInput.value.slice(0, -1);
                    searchInput.dispatchEvent(EventGenerator.input());
                    fixture.detectChanges();
                    await fixture.whenStable();
                };

                // 4 characters
                for (let i = 1; i < MIN_CHARS; i++) {
                    await typeChar();
                    expect(sourceSpy).toHaveBeenCalledTimes(0);
                }

                // 5 characters
                await typeChar();
                expect(sourceSpy).toHaveBeenCalledTimes(1);

                // 4 characters
                await deleteChar();
                expect(sourceSpy).toHaveBeenCalledTimes(1);

                // 5 characters
                await typeChar();
                expect(sourceSpy).toHaveBeenCalledTimes(2);

                // 6 characters
                await typeChar();
                expect(sourceSpy).toHaveBeenCalledTimes(3);
            }));
        });

        describe('Feature: searchSourceStrategy', () => {
            const NUMBER_OF_ITEMS_PER_VIEW = 5;
            beforeEach(() => {
                uiSuggest.searchSourceFactory = (searchTerm?: string, fetchCount?: number, start?: number) => of({
                    data: range(start ?? 0, (start ?? 0) + (fetchCount ?? 0))
                        .map(idx => ({
                            id: idx,
                            text: `Element ${idx}`,
                            expandable: true,
                        })).filter(option => option.text.includes((searchTerm ?? '').trim())),
                });

                fixture.detectChanges();

                uiSuggest.searchSourceStrategy = 'lazy';
                fixture.detectChanges();

                uiSuggest.displayCount = NUMBER_OF_ITEMS_PER_VIEW;
                fixture.detectChanges();
            });

            it('should not load more data if current response is empty', waitForAsync(async () => {
                uiSuggest.searchSourceFactory = (_searchTerm?: string, _fetchCount?: number, _start?: number) => of({
                    data: [],
                });

                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                await fixture.whenStable();

                expect(uiSuggest.items.length).toBe(0);
            }));

            it('should display items even if the totalCount is not known', waitForAsync(async () => {
                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                await fixture.whenStable();

                const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

                expect(uiSuggest.items.length).not.toBeNull();
                expect(itemListEntries.length).toBe(NUMBER_OF_ITEMS_PER_VIEW + 1);
                const lastItem = itemListEntries.slice(-1)[0];
                expect(lastItem.nativeElement.innerText).toBe('Loading...');
            }));

            it('should load more data at bottom of the list', waitForAsync(async () => {
                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                await fixture.whenStable();

                expect(uiSuggest.items.length).toBe(NUMBER_OF_ITEMS_PER_VIEW + 1);

                const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
                for (let i = 0; i <= uiSuggest.items.length; i++) {
                    itemContainer.nativeElement.dispatchEvent(
                        EventGenerator.keyDown(Key.ArrowUp),
                    );

                }
                fixture.detectChanges();
                await fixture.whenStable();

                expect(uiSuggest.items.length).toBe(2 * NUMBER_OF_ITEMS_PER_VIEW + 1);
            }));
        });

        it('should generate the same number of items as those in total if displayCount is set to a lower limit ', waitForAsync(async () => {
            uiSuggest.displayCount = 5;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();
            await fixture.whenStable();

            expect(uiSuggest.items.length).toBe(items.length);
            const response = await firstValueFrom(sourceSpy.calls.mostRecent().returnValue);
            expect(uiSuggest.items.length).toEqual(response.total!);
        }));

        it('should load an additional chunk if navigating out of range', fakeAsync(() => {
            uiSuggest.displayCount = 5;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
            tick(SEARCH_DEBOUNCE);

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
            for (let i = 0; i <= uiSuggest.displayCount; i++) {
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowDown),
                );
                fixture.detectChanges();
                tick();
            }

            fixture.detectChanges();
            tick(VIRTUAL_SCROLL_DEBOUNCE);

            expect(sourceSpy).toHaveBeenCalledTimes(2);
        }));

        it('should not request aditional chunk if navigating down and then back up', fakeAsync(() => {
            uiSuggest.displayCount = 5;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
            tick(SEARCH_DEBOUNCE);

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
            for (let i = 0; i <= uiSuggest.displayCount; i++) {
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowDown),
                );
                fixture.detectChanges();
                tick();
            }

            fixture.detectChanges();
            tick(VIRTUAL_SCROLL_DEBOUNCE);

            for (let i = 0; i <= uiSuggest.displayCount; i++) {
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowUp),
                );
                fixture.detectChanges();
                tick();
            }

            fixture.detectChanges();
            tick(VIRTUAL_SCROLL_DEBOUNCE);

            expect(sourceSpy).toHaveBeenCalledTimes(2);
        }));

        it('should render items in a loading state the new data has not arrived', fakeAsync(() => {
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
            tick(SEARCH_DEBOUNCE);

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            for (let i = 0; i < uiSuggest.items.length - 1; i++) {
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowDown),
                );
                fixture.detectChanges();
                tick(1);

                const idx = uiSuggest.activeIndex;

                // update the view when scrolling occurs
                if (idx >= uiSuggest.displayCount) {
                    fixture.detectChanges();
                    tick(1);

                    const currentItem = uiSuggest.items[idx];
                    expect(currentItem.loading).toBe(VirtualScrollItemStatus.initial);

                    const selectedItem = fixture.debugElement.query(By.css('.mat-list-item.active'));
                    const elementClasses = selectedItem.nativeElement.classList;
                    expect(uiSuggest.activeIndex).toEqual(i + 1);
                    expect(elementClasses.contains('is-loading')).toBeTruthy();
                }
            }

            tick(VIRTUAL_SCROLL_DEBOUNCE);
        }));

        describe('Feature: custom value', () => {
            let randomString: string;

            beforeEach(() => {
                component.enableCustomValue = true;
                randomString = faker.random.uuid();
            });

            it('should set value', waitForAsync(async () => {
                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;
                searchInput.value = randomString;
                searchInput.dispatchEvent(EventGenerator.input());
                fixture.detectChanges();
                await fixture.whenStable();

                const [query] = sourceSpy.calls.mostRecent().args;
                expect(query).toBe(randomString);

                const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.Enter),
                );
                fixture.detectChanges();

                expect(uiSuggest.value[0].text).toBe(randomString);
            }));

            it('should render new item if reversed', waitForAsync(async () => {
                component.direction = 'up';
                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;
                searchInput.value = randomString;
                searchInput.dispatchEvent(EventGenerator.input());
                fixture.detectChanges();
                await fixture.whenStable();

                const customItem = fixture.debugElement.query(By.css('.custom-item'));
                expect(!!customItem).toBe(true);
            }));

            it('should NOT render if reversed and search matches results', waitForAsync(async () => {
                uiSuggest.direction = 'up';
                const customString = faker.helpers.randomize(items).text;
                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;
                searchInput.value = customString;
                searchInput.dispatchEvent(EventGenerator.input());
                fixture.detectChanges();
                await fixture.whenStable();

                const customItem = fixture.debugElement.query(By.css('.custom-item'));
                expect(!!customItem).toBe(false);
            }));

            it('should cycle through with custom value in the list and select it if focused', fakeAsync(() => {
                // there should be 0 < QQ_* results in mockResults but no 'QQ_'
                const customString = 'QQ_';
                overrideItems = [
                    ...items,
                    {
                        id: 'QQ_1',
                        text: 'QQ_1',
                    },
                    {
                        id: 'QQ_2',
                        text: 'QQ_2',
                    },
                    {
                        id: 'QQ_3',
                        text: 'QQ_3',
                    },
                ];
                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();
                tick(SEARCH_DEBOUNCE);

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;
                searchInput.value = customString;
                searchInput.dispatchEvent(EventGenerator.input());
                fixture.detectChanges();
                tick(SEARCH_DEBOUNCE);

                const customItem = fixture.debugElement.query(By.css('.custom-item'));

                expect(uiSuggest.items.length).toBeGreaterThan(0);
                expect(!!customItem).toBe(true);

                const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
                for (let i = 0; i <= uiSuggest.items.length; i++) {
                    itemContainer.nativeElement.dispatchEvent(
                        EventGenerator.keyDown(Key.ArrowUp),
                    );
                }
                fixture.detectChanges();
                tick(VIRTUAL_SCROLL_DEBOUNCE);

                expect(uiSuggest.activeIndex).toBe(-1);

                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.Enter),
                );
                fixture.detectChanges();
                tick(VIRTUAL_SCROLL_DEBOUNCE);

                expect(uiSuggest.value[0].text).toBe(customString);

                discardPeriodicTasks();
            }));

            it('should not select partial match if not focused', fakeAsync(() => {
                // there should be 0 < QQ_* results in mockResults but no 'QQ_'
                const customString = 'QQ_';
                overrideItems = [
                    ...items,
                    {
                        id: 'QQ_1',
                        text: 'QQ_1',
                    },
                    {
                        id: 'QQ_2',
                        text: 'QQ_2',
                    },
                    {
                        id: 'QQ_3',
                        text: 'QQ_3',
                    },
                ];
                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();
                tick(SEARCH_DEBOUNCE);

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;
                searchInput.value = customString;
                searchInput.dispatchEvent(new Event('input'));
                fixture.detectChanges();
                tick(SEARCH_DEBOUNCE);

                const customItem = fixture.debugElement.query(By.css('.custom-item'));

                expect(uiSuggest.items.length).toBeGreaterThan(0);
                expect(!!customItem).toBe(true);

                const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));
                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.ArrowUp),
                );

                itemContainer.nativeElement.dispatchEvent(
                    EventGenerator.keyDown(Key.Tab),
                );
                fixture.detectChanges();
                tick(VIRTUAL_SCROLL_DEBOUNCE);

                expect(uiSuggest.value.length).toBe(0);

                discardPeriodicTasks();
            }));

            it('should select partial match if focused', fakeAsync(() => {
                // there should be 0 < QQ_* results in mockResults but no 'QQ_'
                const customString = 'QQ_';
                overrideItems = [
                    ...items,
                    {
                        id: 'QQ_1',
                        text: 'QQ_1',
                    },
                    {
                        id: 'QQ_2',
                        text: 'QQ_2',
                    },
                    {
                        id: 'QQ_3',
                        text: 'QQ_3',
                    },
                ];
                fixture.detectChanges();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();
                tick(SEARCH_DEBOUNCE);

                const searchInput = fixture.debugElement.query(By.css('.mat-input-element')).nativeElement;
                searchInput.value = customString;
                searchInput.dispatchEvent(EventGenerator.input());
                fixture.detectChanges();
                tick(SEARCH_DEBOUNCE);

                const customItem = fixture.debugElement.query(By.css('.custom-item'));

                expect(uiSuggest.items.length).toBeGreaterThan(0);
                expect(!!customItem).toBe(true);

                const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

                [Key.ArrowUp, Key.ArrowDown, Key.Tab].forEach(key => {
                    itemContainer.nativeElement.dispatchEvent(
                        EventGenerator.keyDown(key),
                    );
                    fixture.detectChanges();
                    tick();
                });

                tick(VIRTUAL_SCROLL_DEBOUNCE);

                expect(uiSuggest.value.length).toBe(1);
                expect(uiSuggest.value[0].text).toBe(customString);

                discardPeriodicTasks();
            }));
        });
    });
};

describe('Component: UiSuggest', () => {
    beforeEach(() => {
        faker.seed(1337);
    });

    @Component({
        template: `
            <ui-suggest [placeholder]="placeholder"
                        [defaultValue]="defaultValue"
                        [clearable]="clearable"
                        [searchable]="searchable"
                        [enableCustomValue]="enableCustomValue"
                        [alwaysExpanded]="alwaysExpanded"
                        [headerItems]="headerItems"
                        [items]="items"
                        [value]="value"
                        [direction]="direction"
                        [displayPriority]="displayPriority"
                        [disabled]="disabled"
                        [multiple]="multiple"
                        [fetchStrategy]="fetchStrategy"
                        [minChars]="minChars"
                        [drillDown]="drillDown"
                        [readonly]="readonly"
                        [compact]="compact">
            </ui-suggest>
        `,
    })
    class UiSuggestFixtureComponent extends UiSuggestFixtureDirective { }
    describe('Type: standalone', () => {
        let fixture: ComponentFixture<UiSuggestFixtureComponent>;
        // @ts-ignore
        let component: UiSuggestFixtureComponent;
        let uiSuggest: UiSuggestComponent;

        const beforeEachFn = () => {
            TestBed.configureTestingModule({
                imports: [
                    UiSuggestModule,
                    NoopAnimationsModule,
                ],
                declarations: [
                    UiSuggestFixtureComponent,
                ],
            });

            const compFixture = TestBed.createComponent(UiSuggestFixtureComponent);

            return {
                fixture: compFixture,
                component: compFixture.componentInstance,
                uiSuggest: compFixture.componentInstance.uiSuggest,
            };
        };

        describe('Behavior: generic', () => {
            sharedSpecifications(beforeEachFn);
        });

        describe('Behavior: specific', () => {
            beforeEach(() => {
                const setup = beforeEachFn();
                fixture = setup.fixture;
                component = setup.component;
                uiSuggest = setup.uiSuggest;
            });

            it('should NOT initialize ngControl', () => {
                fixture.detectChanges();

                expect(uiSuggest).not.toBeNull();
                expect(uiSuggest.ngControl).toBeNull();
            });

            it('should NOT be marked as a form control', () => {
                fixture.detectChanges();

                const suggest = fixture.debugElement.query(By.css('.form-control'));

                expect(suggest).toBeNull();
            });
        });
    });

    @Component({
        template: `
        <form [formGroup]="formGroup">
            <mat-form-field placeholderFloat="always"
                            class="test-form-field">
                <ui-suggest [placeholder]="placeholder"
                            [defaultValue]="defaultValue"
                            [clearable]="clearable"
                            [searchable]="searchable"
                            [enableCustomValue]="enableCustomValue"
                            [headerItems]="headerItems"
                            [alwaysExpanded]="alwaysExpanded"
                            [items]="items"
                            [direction]="direction"
                            [displayPriority]="displayPriority"
                            [disabled]="disabled"
                            [multiple]="multiple"
                            [readonly]="readonly"
                            [fetchStrategy]="fetchStrategy"
                            [minChars]="minChars"
                            [drillDown]="drillDown"
                            [compact]="compact"
                            formControlName="test">
            </ui-suggest>
            </mat-form-field>
        </form>
        `,
    })
    class UiSuggestFormControlFixtureComponent extends UiSuggestFixtureDirective {
        formGroup: FormGroup;

        set value(value: ISuggestValue[]) {
            this.formGroup.get('test')?.setValue(value);
        }

        get value(): ISuggestValue[] {
            return this.formGroup.get('test')?.value;
        }

        get formControl() {
            return this.formGroup.get('test');
        }

        constructor(fb: FormBuilder) {
            super();

            this.formGroup = fb.group({
                test: [[]],
            });
        }
    }
    describe('Type: form control', () => {
        let fixture: ComponentFixture<UiSuggestFormControlFixtureComponent>;
        let component: UiSuggestFormControlFixtureComponent;
        let uiSuggest: UiSuggestComponent;
        let assert: UiSuggestAssert;

        const beforeEachFn = () => {
            TestBed.configureTestingModule({
                imports: [
                    UiSuggestModule,
                    ReactiveFormsModule,
                    MatInputModule,
                    NoopAnimationsModule,
                ],
                declarations: [
                    UiSuggestFormControlFixtureComponent,
                ],
            });

            const compFixture = TestBed.createComponent(UiSuggestFormControlFixtureComponent);

            return {
                fixture: compFixture,
                component: compFixture.componentInstance,
                uiSuggest: compFixture.componentInstance.uiSuggest,
            };
        };

        describe('Behavior: generic', () => {
            sharedSpecifications(beforeEachFn);
        });

        describe('Behavior: specific', () => {
            beforeEach(() => {
                const setup = beforeEachFn();
                fixture = setup.fixture;
                component = setup.component;
                uiSuggest = setup.uiSuggest;
                assert = new UiSuggestAssert(fixture.debugElement, uiSuggest);

                component.items = generateSuggetionItemList('random');
            });

            it('should initialize ngControl', () => {
                fixture.detectChanges();

                expect(uiSuggest).not.toBeNull();
                expect(uiSuggest.ngControl).not.toBeNull();
            });

            it('should be marked as a form control', () => {
                fixture.detectChanges();

                const suggest = fixture.debugElement.query(By.css('.form-control'));

                expect(suggest).not.toBeNull();
                expect(suggest.nativeElement.tagName.toLowerCase()).toEqual('ui-suggest');
            });

            it('should open the list when clicking the container', () => {
                fixture.detectChanges();

                assert.isClosed();

                const formFieldUnderline = fixture.debugElement.query(By.css('.test-form-field .mat-form-field-label'));

                formFieldUnderline.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                assert.isOpen();
            });

            it('should be marked as disabled when updating state via form', () => {
                fixture.detectChanges();

                assert.isEnabled();

                component.formControl!.disable();

                fixture.detectChanges();

                assert.isDisabled();
            });

            it('should remove NULL and Undefined entries when updating value via form', () => {
                fixture.detectChanges();

                const item = faker.helpers.randomize(component.items!);

                const dirtyArray = [undefined, null, item, null, undefined];

                component.formControl!.setValue(dirtyArray);

                fixture.detectChanges();

                expect(uiSuggest.value.length).toEqual(1);
                expect(uiSuggest.value).toEqual([item]);
            });

            it('should replace old value if updating value via form', () => {
                fixture.detectChanges();

                expect(component.formControl!.value.length).toEqual(0);

                component.formControl!.setValue([faker.helpers.randomize(component.items!)]);

                expect(uiSuggest.value.length).toEqual(1);

                fixture.detectChanges();

                const finalValue = [faker.helpers.randomize(component.items!)];

                component.formControl!.setValue(finalValue);

                expect(uiSuggest.value.length).toEqual(1);
                expect(uiSuggest.value).toEqual(finalValue);
            });

            it('should be valid without a value if no validators are set', () => {
                fixture.detectChanges();

                expect(component.formGroup.valid).toBeTruthy();
            });

            it('should have aria attribute set to true if marked as required', () => {
                uiSuggest.required = true;
                fixture.detectChanges();

                const combobox = fixture.debugElement.query(By.css('ui-suggest [role=combobox]'));
                expect(combobox.attributes['aria-required']).toEqual('true');
            });

            it('should have aria attribute set to false if it is NOT required', () => {
                fixture.detectChanges();

                const combobox = fixture.debugElement.query(By.css('ui-suggest [role=combobox]'));
                expect(combobox.attributes['aria-required']).toEqual('false');
            });
        });
    });

    @Component({
        template: `
            <ui-suggest
                [placeholder]="placeholder"
                [defaultValue]="defaultValue"
                [clearable]="clearable"
                [searchable]="searchable"
                [enableCustomValue]="enableCustomValue"
                [alwaysExpanded]="alwaysExpanded"
                [headerItems]="headerItems"
                [items]="items"
                [value]="value"
                [direction]="direction"
                [displayPriority]="displayPriority"
                [disabled]="disabled"
                [multiple]="multiple"
                [readonly]="readonly"
                [fetchStrategy]="fetchStrategy"
                [displayTemplateValue]="displayTemplateValue"
                [searchableCountInfo]="searchableCountInfo"
                [minChars]="minChars"
                [drillDown]="drillDown"
                [compact]="compact"
                [displayValueFactory]="displayValueFactory"
                [compactSummaryTemplate]="useCompactTemplate ? compactSummaryTemplate : undefined"
            >
                <ng-template let-item>
                    <div class="item-template">{{ item.text }}</div>
                </ng-template>
            </ui-suggest>
            <ng-template #compactSummaryTemplate let-value>
                <div class="custom-display-value">
                    <span class="text-ellipsis">{{value?.[0]?.text}}</span>
                    <span *ngIf="(value?.length || 0) > 1">
                        (+{{ (value?.length || 0) - 1 }}
                        {{ value?.length === 2 ? "other" : "others" }})
                    </span>
                </div>
            </ng-template>
        `,
    })
    class UiSuggestCustomTemplateFixtureComponent extends UiSuggestFixtureDirective { }

    describe('Type: custom template', () => {
        let fixture: ComponentFixture<UiSuggestCustomTemplateFixtureComponent>;
        let component: UiSuggestCustomTemplateFixtureComponent;

        const beforeEachFn = () => {
            TestBed.configureTestingModule({
                imports: [
                    UiSuggestModule,
                    ReactiveFormsModule,
                    MatInputModule,
                    NoopAnimationsModule,
                ],
                declarations: [
                    UiSuggestCustomTemplateFixtureComponent,
                ],
            });

            const compFixture = TestBed.createComponent(UiSuggestCustomTemplateFixtureComponent);

            return {
                fixture: compFixture,
                component: compFixture.componentInstance,
                uiSuggest: compFixture.componentInstance.uiSuggest,
            };
        };

        describe('Behavior: Specific', () => {
            beforeEach(() => {
                const setup = beforeEachFn();
                fixture = setup.fixture;
                component = setup.component;
            });

            it('should render the list items using the provided custom template', (async () => {
                const items = generateSuggetionItemList(5);
                component.items = items;

                fixture.detectChanges();
                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();
                await fixture.whenStable();

                const generatedItems = fixture.debugElement.queryAll(By.css('ui-suggest .item-template'));

                expect(items.length).toBe(generatedItems.length);

                items.forEach((item, index) => {
                    expect(item.text).toBe(generatedItems[index].nativeElement.innerText);
                });
            }));

            it('should render the compact summary using the provided value factory when custom template is not defined', (async () => {
                const expectedDisplaySummary = 'My Custom Test Display';
                const items = generateSuggetionItemList(5);
                component.items = items;
                component.useCompactTemplate = false;
                component.displayValueFactory = () => expectedDisplaySummary;

                const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
                component.value = selectedValues;

                component.multiple = true;
                component.compact = true;
                component.searchable = true;

                fixture.detectChanges();

                const displayContainer = fixture.debugElement.query(By.css('.display-container'));
                const displayValue = displayContainer.query(By.css('.display-value'));
                const summaryText = displayValue.nativeElement.innerText.trim();

                expect(summaryText).toBe(expectedDisplaySummary);
            }));

            it('should render the compact summary using the provided custom template', () => {
                component.items = generateSuggetionItemList('random');

                const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
                component.value = selectedValues;

                component.multiple = true;
                component.compact = true;
                component.searchable = true;

                fixture.detectChanges();

                const displayContainer = fixture.debugElement.query(By.css('.display-container'));
                const displayValue = displayContainer.query(By.css('.custom-display-value'));
                const summaryText = displayValue.nativeElement.innerText.trim();

                expect(summaryText).toBe(`${selectedValues[0].text} (+2 others)`);
            });

            [false, true].forEach((multiple) => {
                [false, true].forEach((displayTemplateValue) => {
                    it(`should ${!multiple && displayTemplateValue ? '' : 'NOT'} render the displayed value with custom` +
                        `template if displayTemplateValue is ${displayTemplateValue}, multiple is ${multiple}`, () => {
                            component.displayTemplateValue = displayTemplateValue;
                            component.multiple = multiple;

                            const items = generateSuggetionItemList(5);
                            component.items = items;
                            component.value = [faker.helpers.randomize(items)];

                            fixture.detectChanges();
                            const display = fixture.debugElement.query(By.css('.item-template'));

                            if (!multiple && displayTemplateValue) {
                                expect(display).toBeDefined();
                            } else {
                                expect(display).toBeNull();
                            }
                        });
                });
            });

            [undefined, {
                count: 5,
                message: '5 might not be all',
            }].forEach((searchableCountInfo) => {
                [0, 3, 5, 7].forEach((itemsCount) => {
                    [false, true].forEach((searchable) => {
                        const shouldRenderMessage = itemsCount > 0 && itemsCount === searchableCountInfo?.count && searchable;

                        it(
                            `should ${shouldRenderMessage ? '' : 'NOT'} render the max count info ` +
                            `is ${searchable ? '' : 'NOT'} searchable ` +
                            `if searchableCountInfo is [${JSON.stringify(searchableCountInfo)}], and items rendered are ${itemsCount}`,
                            fakeAsync(() => {
                                component.searchableCountInfo = searchableCountInfo;
                                component.searchable = searchable;

                                const items = generateSuggetionItemList(itemsCount, 'a');
                                component.items = items;

                                fixture.detectChanges();
                                tick(SEARCH_DEBOUNCE);
                                const display = fixture.debugElement.query(By.css('.display'));

                                display.nativeElement.dispatchEvent(EventGenerator.click);
                                fixture.detectChanges();

                                const customInfoMessageCount = fixture.debugElement.query(By.css('.item-max-count-info-message'));

                                if (shouldRenderMessage) {
                                    expect(customInfoMessageCount).toBeDefined();
                                    expect(customInfoMessageCount.nativeNode!.innerText.includes(searchableCountInfo!.message)).toBeTrue();

                                    populateSearchFor('a', fixture);
                                    tick(SEARCH_DEBOUNCE);
                                    fixture.detectChanges();

                                    const noMessage = fixture.debugElement.query(By.css('.item-max-count-info-message'));
                                    expect(noMessage).toBeNull();
                                } else {
                                    expect(customInfoMessageCount).toBeNull();
                                }

                                flush();
                                discardPeriodicTasks();
                            }));
                    });
                });
            });
        });
    });
});
