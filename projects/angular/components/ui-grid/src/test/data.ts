import * as faker from 'faker';

import { ITestEntity } from './testEntity';

let ENTITY_COUNT = 0;

export const generateEntity = (): ITestEntity => ({
    id: ++ENTITY_COUNT,
    myNumber: faker.random.number(),
    myString: faker.random.alphaNumeric(16),
    myBool: faker.random.boolean(),
    myDate: faker.date.future(),
    myObj: {
        myObjString: faker.random.alphaNumeric(32),
        myObjNumber: faker.random.number(),
        myObjBool: faker.random.boolean(),
        myObjDate: faker.date.future(),
    },
});
