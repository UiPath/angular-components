import * as faker from 'faker';

export const generateListFactory = <T>(mapper: () => T, wrapper: (fn: (...args: any[]) => T[]) => T[] = (fn) => fn()) =>
    (count: number | 'random' = 5) => wrapper(() =>
        Array(count === 'random' ?
            faker.random.number({
                min: 5,
                max: 100,
            }) :
            count,
        ).fill(0).map(mapper));
