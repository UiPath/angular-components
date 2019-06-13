import * as faker from 'faker';

export const generateListFactory = <T>(mapper: () => T) =>
    (count: number | 'random' = 5) =>
        Array(count === 'random' ?
            faker.random.number({ min: 5, max: 100 }) :
            count,
        ).fill(0).map(mapper);
