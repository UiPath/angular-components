import {
    Component,
    Directive,
    ViewChild,
} from '@angular/core';
import {
    async,
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    TestBed,
    tick,
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

import * as faker from 'faker';
import { VirtualScrollItemStatus } from 'projects/angular/directives/ui-virtual-scroll-range-loader/src/public_api';
import {
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
    ISuggestValue,
    ISuggestValues,
} from './models';
import {
    generateSuggestionItem,
    generateSuggetionItemList,
} from './test';
import { UiSuggestComponent } from './ui-suggest.component';
import { UiSuggestModule } from './ui-suggest.module';

type SuggestProperties = 'disabled' | 'readonly';

@Directive()
class UiSuggestFixtureDirective {
    @ViewChild(UiSuggestComponent, {
        static: true,
    })
    public uiSuggest!: UiSuggestComponent;

    // tslint:disable-next-line: no-inferrable-types
    public defaultValue?: string = 'All';
    public placeholder = 'My Field';

    public clearable?: boolean;
    public searchable?: boolean;
    public alwaysExpanded?: boolean;
    public disabled?: boolean;
    public multiple?: boolean;
    public readonly?: boolean;
    public enableCustomValue?: boolean;
    public items?: ISuggestValue[];
    public value?: ISuggestValue[];
    public direction: 'up' | 'down' = 'down';
    public displayPriority: 'default' | 'selected' = 'default';
    public fetchStrategy: 'eager' | 'onOpen' = 'eager';
    public minChars = 0;
}

const searchFor = (value: string, fixture: ComponentFixture<UiSuggestFixtureDirective>) => {
    const display = fixture.debugElement.query(By.css('.display'));
    display.nativeElement.dispatchEvent(EventGenerator.click);

    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(EventGenerator.input());

    fixture.detectChanges();
};

const sharedSpecifications = (
    beforeEachFn: () => {
        fixture: ComponentFixture<UiSuggestFixtureDirective>,
        component: UiSuggestFixtureDirective,
        uiSuggest: UiSuggestComponent,
    },
) => {
    let fixture: ComponentFixture<UiSuggestFixtureDirective>;
    let component: UiSuggestFixtureDirective;
    let uiSuggest: UiSuggestComponent;

    beforeEach(() => {
        const setup = beforeEachFn();
        fixture = setup.fixture;
        component = setup.component;
        uiSuggest = setup.uiSuggest;
    });

    describe('Behavior: standard usage', () => {
        it('should be initialized', () => {
            expect(uiSuggest).toBeDefined();
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

        it('should display a list item with the noResultsPlaceholder if searchable and empty', async(async () => {
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

        it('should render the list open and not close on selection if alwaysExpanded is true', (async () => {
            const items = generateSuggetionItemList(10);

            component.alwaysExpanded = true;
            component.items = items;

            fixture.detectChanges();
            await fixture.whenStable();

            const itemListEntries = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(items.length);

            const itemIndex = Math.floor(Math.random() * items.length);
            const currentListItem = fixture.debugElement.queryAll(
                By.css('.mat-list-item'),
            )[itemIndex];

            currentListItem.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(itemListEntries).not.toBeNull();
            expect(itemListEntries.length).toEqual(items.length);
        }));

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

        it('should display no items if the source throws an error', async(async () => {
            const items = generateSuggetionItemList('random');

            component.searchable = true;
            component.items = items;
            uiSuggest.searchSourceFactory = () => {
                return of([...items]).pipe(
                    map(() => {
                        throw new Error('Testing if all goes well');
                    }),
                );
            };

            await fixture.whenStable();

            expect(uiSuggest.loading).toBeFalsy();
            expect(uiSuggest.value.length).toEqual(0);
        }));

        it('should query ONLY ONCE if spammed', (done) => {
            const items = generateSuggetionItemList('random');

            component.searchable = true;
            component.items = items;

            fixture.detectChanges();

            uiSuggest.searchSourceFactory = (term) => {
                return of([...items]).pipe(
                    delay(100),
                    map(itemList => ({
                        data: itemList.filter(item => item.text.includes(term as string)),
                        total: itemList.length,
                    }) as ISuggestValues<any>),
                );
            };

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

                const itemList = fixture.debugElement.query(By.css('.item-list-container'));
                const itemListClasses = itemList.nativeElement.classList;

                expect(uiSuggest.isOpen).toBeTruthy();
                expect(itemListClasses.contains('item-list-container-state-open')).toBeTruthy();

                component[state] = true;

                fixture.detectChanges();

                expect(uiSuggest.isOpen).toBeFalsy();
                expect(itemListClasses.contains('item-list-container-state-closed')).toBeTruthy();
            });

            it(`should not open if the component is ${state}`, () => {
                component[state] = true;

                fixture.detectChanges();

                expect(uiSuggest.isOpen).toBeFalsy();

                fixture.detectChanges();
                const display = fixture.debugElement.query(By.css('.display'));

                display.nativeElement.dispatchEvent(EventGenerator.click);

                expect(uiSuggest.isOpen).toBeFalsy();
            });
        });

        describe('Scenario: toggle disabled state', () => {
            it('should toggle loading state if it is searchable with items', () => {
                const items = generateSuggetionItemList();
                component.items = items;
                component.disabled = true;
                component.searchable = true;

                fixture.detectChanges();

                expect(uiSuggest.disabled).toBeTruthy();
                expect(uiSuggest.loading$.value).toBeFalsy();

                component.disabled = false;
                fixture.detectChanges();

                expect(uiSuggest.disabled).toBeFalsy();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);

                expect(uiSuggest.loading$.value).toBeFalsy();
            });

            it('should not be in loading state if it has a searchSourceFactory', async () => {
                const items = generateSuggetionItemList();
                component.disabled = true;
                uiSuggest.searchSourceFactory = (term) => {
                    return of([...items]).pipe(
                        map(itemList => ({
                            data: itemList.filter(item => item.text.includes(term as string)),
                            total: itemList.length,
                        }) as ISuggestValues<any>),
                    );
                };

                fixture.detectChanges();
                expect(uiSuggest.disabled).toBeTruthy();

                component.disabled = false;
                fixture.detectChanges();
                expect(uiSuggest.disabled).toBeFalsy();

                const display = fixture.debugElement.query(By.css('.display'));
                display.nativeElement.dispatchEvent(EventGenerator.click);
                await fixture.whenStable();

                expect(uiSuggest.loading$.value).toBeFalsy();
            });
        });


        it('should not open on first click and close on the second', () => {
            fixture.detectChanges();

            expect(uiSuggest.isOpen).toBeFalsy();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));

            display.nativeElement.dispatchEvent(EventGenerator.click);

            expect(uiSuggest.isOpen).toBeTruthy();

            display.nativeElement.dispatchEvent(EventGenerator.click);

            expect(uiSuggest.isOpen).toBeFalsy();
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

            expect(uiSuggest.isOpen).toBeFalsy();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            expect(uiSuggest.isOpen).toBeTruthy();
        });

        it('should open when pressing Space', () => {
            fixture.detectChanges();

            expect(uiSuggest.isOpen).toBeFalsy();

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyUp(Key.Space),
            );

            expect(uiSuggest.isOpen).toBeTruthy();
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

            expect(uiSuggest.isOpen).toBeTruthy();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            expect(uiSuggest.isOpen).toBeFalsy();
        });

        it('should NOT close if selecting an item via navigation and multiple selection is ENABLED', () => {
            component.multiple = true;

            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            expect(uiSuggest.isOpen).toBeTruthy();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.ArrowDown),
            );

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            expect(uiSuggest.isOpen).toBeTruthy();
        });

        it('should close if Tab is pressed', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            expect(uiSuggest.isOpen).toBeTruthy();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Tab),
            );

            expect(uiSuggest.isOpen).toBeFalsy();
        });

        it('should close if Shift + Tab is pressed', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            expect(uiSuggest.isOpen).toBeTruthy();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Tab, Key.Shift),
            );

            expect(uiSuggest.isOpen).toBeFalsy();
        });

        it('should close if Esc is pressed', () => {
            fixture.detectChanges();
            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(
                EventGenerator.keyDown(Key.Enter),
            );

            fixture.detectChanges();

            expect(uiSuggest.isOpen).toBeTruthy();

            const itemContainer = fixture.debugElement.query(By.css('.item-list-container'));

            itemContainer.nativeElement.dispatchEvent(
                EventGenerator.keyUp(Key.Escape),
            );

            expect(uiSuggest.isOpen).toBeFalsy();
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

    describe('Selection: single value', () => {
        it('should have one list item entry for each item provided', async(async () => {
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

        it('should set the selected item from the list as active when clicked', async(async () => {
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

        it('should replace the current value if selecting a new one', async(async () => {
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

            it('should append the value to the list if there is no full match', async(async () => {
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

            it('should be active if partial matches exist', async(async () => {
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

            it('should have the custom text match the input value if reopened', async(async () => {
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

            it('should trim the text when added', async(async () => {
                fixture.detectChanges();

                const word = faker.random.word();
                const wordWithWhitespace = `${
                    Array(6).fill(' ').join('')
                    }${word}${
                    Array(6).fill(' ').join('')
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
            component.defaultValue = undefined;
        });

        it('should display all selected values', () => {
            const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
            component.value = selectedValues;

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

            const expectedText = selectedValues
                .map(value => value.text)
                .join(', ');
            expect(displayValue.nativeElement.innerText.trim()).toBe(expectedText);
        });

        it('should have a checkbox next to each item entry', async(async () => {
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            for (const itemEntry of itemList) {
                const checkbox = itemEntry.query(By.css('.mat-checkbox'));
                const label = itemEntry.query(By.css('.text-label'));
                expect(checkbox).not.toBeNull();
                expect(checkbox.nativeElement.nextElementSibling).toBe(label.nativeElement);
            }
        }));

        it('should have the chechbox checked for selected items', async(async () => {
            const selectedValues = component.items!.slice(0, 5);
            component.value = selectedValues;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();

            const itemList = fixture.debugElement.queryAll(By.css('.mat-list-item'));

            for (const itemEntry of itemList) {
                const label = itemEntry.query(By.css('.text-label'));
                const labelText = label.nativeElement.innerText.trim();
                if (!!selectedValues.find(value => value.text === labelText)) {
                    const checkbox = itemEntry.query(By.css('input:checked'));
                    expect(checkbox).not.toBeNull();
                }
            }

            const checkedCheckboxes = fixture.debugElement.queryAll(By.css('input:checked'));
            expect(checkedCheckboxes.length).toBe(selectedValues.length);
        }));

        it('should remove a selected item if clicked', async(async () => {
            component.displayPriority = 'selected';
            const selectedValues = faker.helpers.shuffle(component.items!).slice(0, 3);
            component.value = selectedValues;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();

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

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            await fixture.whenStable();

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

            const display = fixture.debugElement.query(By.css('.display'));
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
        const SEARCH_DEBOUNCE = 300 + 100;
        const VIRTUAL_SCROLL_DEBOUNCE = 100 + 100;

        const items = generateSuggetionItemList(100);
        let overrideItems: ISuggestValue[] | undefined;

        const asyncSearchFactory = (query = '', fetchSize = 10, start = 0) => {
            const source = overrideItems || items;

            const results = query !== '' ?
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
                    delay(0),
                );
        };

        let sourceSpy: jasmine.Spy<(query: string, fetchSize: number, start: number) => Observable<ISuggestValues<any>>>;

        beforeEach(() => {
            overrideItems = undefined;
            uiSuggest.searchSourceFactory = asyncSearchFactory;
            sourceSpy = spyOn<UiSuggestComponent, any>(uiSuggest, 'searchSourceFactory');
            sourceSpy.and.callThrough();
            component.searchable = true;
            uiSuggest.displayCount = 10;
        });

        describe('Feature: fetchStrategy', () => {
            it('should make fetch call if fetchStrategy is `eager`', async(async () => {
                fixture.detectChanges();
                await fixture.whenStable();

                expect(sourceSpy).toHaveBeenCalled();
            }));

            it('should not fetch if fetchStrategy is `onOpen`', async(async () => {
                component.fetchStrategy = 'onOpen';
                fixture.detectChanges();
                await fixture.whenStable();

                expect(sourceSpy).toHaveBeenCalledTimes(0);
            }));

            it('should call fetch if fetchStrategy is `onOpen` and suggest gets opened', async(async () => {
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

            it(`should fetch call after the 'minChars' is met`, async(async () => {
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

        it('should generate the same number of items as those in total if displayCount is set to a lower limit ', async(async () => {
            uiSuggest.displayCount = 5;
            fixture.detectChanges();

            const display = fixture.debugElement.query(By.css('.display'));
            display.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();
            await fixture.whenStable();

            expect(uiSuggest.items.length).toBe(items.length);
            const response = await sourceSpy.calls.mostRecent().returnValue.toPromise();
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

            it('should set value', async(async () => {
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

            it('should render new item if reversed', async(async () => {
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

            it('should NOT render if reversed and search matches results', async(async () => {
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
                    { id: 'QQ_1', text: 'QQ_1' },
                    { id: 'QQ_2', text: 'QQ_2' },
                    { id: 'QQ_3', text: 'QQ_3' },
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
                    { id: 'QQ_1', text: 'QQ_1' },
                    { id: 'QQ_2', text: 'QQ_2' },
                    { id: 'QQ_3', text: 'QQ_3' },
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
                    { id: 'QQ_1', text: 'QQ_1' },
                    { id: 'QQ_2', text: 'QQ_2' },
                    { id: 'QQ_3', text: 'QQ_3' },
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
                        [items]="items"
                        [value]="value"
                        [direction]="direction"
                        [displayPriority]="displayPriority"
                        [disabled]="disabled"
                        [multiple]="multiple"
                        [fetchStrategy]="fetchStrategy"
                        [minChars]="minChars"
                        [readonly]="readonly">
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
                            [alwaysExpanded]="alwaysExpanded"
                            [items]="items"
                            [direction]="direction"
                            [displayPriority]="displayPriority"
                            [disabled]="disabled"
                            [multiple]="multiple"
                            [readonly]="readonly"
                            [fetchStrategy]="fetchStrategy"
                            [minChars]="minChars"
                            formControlName="test">
            </ui-suggest>
            </mat-form-field>
        </form>
        `,
    })
    class UiSuggestFormControlFixtureComponent extends UiSuggestFixtureDirective {
        public formGroup: FormGroup;

        public set value(value: ISuggestValue[]) {
            this.formGroup.get('test')?.setValue(value);
        }

        public get value(): ISuggestValue[] {
            return this.formGroup.get('test')?.value;
        }

        get formControl() {
            return this.formGroup.get('test');
        }

        constructor(fb: FormBuilder) {
            super();

            this.formGroup = fb.group({
                'test': [[]],
            });
        }
    }
    describe('Type: form control', () => {
        let fixture: ComponentFixture<UiSuggestFormControlFixtureComponent>;
        let component: UiSuggestFormControlFixtureComponent;
        let uiSuggest: UiSuggestComponent;

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

                expect(uiSuggest.isOpen).toBeFalsy();

                const formFieldUnderline = fixture.debugElement.query(By.css('.test-form-field .mat-form-field-label'));

                formFieldUnderline.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                expect(uiSuggest.isOpen).toBeTruthy();
            });

            it('should be marked as disabled when updating state via form', () => {
                fixture.detectChanges();

                component.formControl!.disable();

                expect(uiSuggest.disabled).toBeTruthy();
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

                const suggest = fixture.debugElement.query(By.css('ui-suggest')).nativeElement as HTMLElement;
                expect(suggest.getAttribute('aria-required')).toEqual('true');
            });

            it('should have aria attribute set to false if it is NOT required', () => {
                fixture.detectChanges();

                const suggest = fixture.debugElement.query(By.css('ui-suggest')).nativeElement as HTMLElement;
                expect(suggest.getAttribute('aria-required')).toEqual('false');
            });
        });
    });


    @Component({
        template: `
                <ui-suggest [placeholder]="placeholder"
                            [defaultValue]="defaultValue"
                            [clearable]="clearable"
                            [searchable]="searchable"
                            [enableCustomValue]="enableCustomValue"
                            [alwaysExpanded]="alwaysExpanded"
                            [items]="items"
                            [value]="value"
                            [direction]="direction"
                            [displayPriority]="displayPriority"
                            [disabled]="disabled"
                            [multiple]="multiple"
                            [readonly]="readonly"
                            [fetchStrategy]="fetchStrategy"
                            [minChars]="minChars">
                            <ng-template let-item >
                                <div class="item-template">{{ item.text }}</div>
                            </ng-template>
            </ui-suggest>
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
        });
    });
});
