import * as faker from 'faker';

import { ISuggestValue } from '../models';

export const generateSuggestionItem = (): ISuggestValue => {
    const value = faker.random.words(3);

    return {
        id: value,
        text: value,
    };
};

export const generateSuggetionItemList =
    (count: number | 'random' = 5): ISuggestValue[] =>
        Array(
            count === 'random' ?
                faker.random.number({ min: 5, max: 50 }) :
                count,
        )
            .fill(0)
            .map(generateSuggestionItem);

