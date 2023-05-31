import { sort } from './sort';

describe('sort', () => {
    [
        {
            array: [{ key: 3 }, { key: 4 }, { key: 2 }, { key: 1 }],
            querySort: 'key',
            result: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }],
        }, {
            array: [{ key: 103 }, { key: 102 }, { key: 101 }, { key: 104 }],
            querySort: '-key',
            result: [{ key: 104 }, { key: 103 }, { key: 102 }, { key: 101 }],
        },
    ].forEach(({ array, querySort, result }) => it('should sort array by column of type number', () => {
        expect(sort(array, querySort)).toEqual(result);
    }));

    [
        {
            array: [{ key: 'b' }, { key: 'd' }, { key: 'a' }, { key: 'c' }],
            querySort: 'key',
            result: [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }],
        }, {
            array: [{ key: 'c' }, { key: 'a' }, { key: 'd' }, { key: 'b' }],
            querySort: '-key',
            result: [{ key: 'd' }, { key: 'c' }, { key: 'b' }, { key: 'a' }],
        },
    ].forEach(({ array, querySort, result }) => it('should sort array by column of type string', () => {
        expect(sort(array, querySort)).toEqual(result);
    }));

    it('should return array unchanged if no querySort is provided', () => {
        const array = [3, 2, 5, 1];
        expect(sort(array)).toEqual(array);
    });

    it('should return array unchanged if key is not found in the objects provided in array', () => {
        const array = [3, 2, 5, 1];
        expect(sort(array, 'notFoundKey')).toEqual(array);
    });
});
