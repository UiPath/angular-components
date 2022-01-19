import * as faker from 'faker';

import { ISuggestValue } from '../models';

export const generateSuggestionItem = (label = ''): ISuggestValue => {
    const value = `${label}${faker.random.words(1)}`;

    return {
        id: value,
        text: value,
        expandable: faker.random.boolean(),
    };
};

export const generateSuggetionItemList =
    (count: number | 'random' = 5, label?: string): ISuggestValue[] =>
        Array(
            count === 'random' ?
                faker.random.number({
                    min: 5,
                    max: 50,
                }) :
                count,
        )
            .fill(0)
            .map(() => generateSuggestionItem(label));

