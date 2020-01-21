
// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-testing';
import 'jasmine-expect';

import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

import * as faker from 'faker';

import { JASMINE_STYLES } from './test.theme';

declare const require: any;

const SEED = 1337;

const materialIconsLink = document.createElement('link');
materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
materialIconsLink.rel = 'stylesheet';
document.head.appendChild(materialIconsLink);

const customStyle = document.createElement('style');
customStyle.innerHTML = JASMINE_STYLES;
document.head.appendChild(customStyle);


const reseed = () => {
    faker.seed(SEED);
    // overwrite Math.radom again in each global context
    Math.random = () => faker.random.number({ min: 0, max: 100000 }) / 100000;
}

beforeEach(reseed);

const __describe = describe;
(global as any).describe = function () {
    reseed();
    __describe.apply(this, arguments as any);
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);

// And load the modules.
context.keys().map(context);
