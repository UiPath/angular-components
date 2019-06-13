import { ISuggestValue } from '@uipath/angular/components/ui-suggest';

import * as faker from 'faker';
import { of } from 'rxjs';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import { UiGridDropdownFilterDirective } from '../filters/ui-grid-dropdown-filter.directive';
import { UiGridSearchFilterDirective } from '../filters/ui-grid-search-filter.directive';
import { ITestEntity } from '../test/testEntity';

export const generateColumn = () => {
    const column = new UiGridColumnDirective<ITestEntity>();

    column.title = faker.company.bsAdjective();
    column.searchable = faker.random.boolean();
    column.method = faker.helpers.randomize(['eq', 'neq', 'ge', 'gt']);
    column.property = faker.random.uuid() as any;

    return column;
};

export const generateDropdownFilter = () => {
    const dropdown = new UiGridDropdownFilterDirective<ITestEntity>();

    const items = faker.random.words(15)
        .split(' ')
        .map(word => ({
            value: faker.random.number(),
            label: word,
        }));

    dropdown.method = faker.helpers.randomize(['eq', 'neq', 'ge', 'gt']);
    dropdown.items = items;

    return dropdown;
};

export interface ISearchableDropdownFilterDefinition<T> {
    dropdown: UiGridSearchFilterDirective<T>;
    items: ISuggestValue[];
}

export const generateSearchFilterDefinition = (): ISearchableDropdownFilterDefinition<ITestEntity> => {
    const dropdown = new UiGridSearchFilterDirective<ITestEntity>();

    const items = faker.random.words(15)
        .split(' ')
        .map(word => ({
            id: faker.random.number(),
            text: word,
        }));

    dropdown.method = faker.helpers.randomize(['eq', 'neq', 'ge', 'gt']);
    dropdown.searchSourceFactory = () => of({ data: items, total: items.length });

    return {
        dropdown,
        items,
    };
};
