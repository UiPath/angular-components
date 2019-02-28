# UiPath - Angular Components Library

Library of Angular components, directives, pipes, services or any other common stuff accros Angular apps in UiPath.

## Documentation

### Install

```
$ npm install @uipath/angular-components
```

### Publish a new version

1. set new version in `projects/angular-components/package.json`
2. run `npm run package` - this will create a new `tgz` bundle in `dist/angular-components/` folder
3. run `npm publish ./dist/angular-components/uipath-angular-components-<new package version>.tgz`

This will publish the new version in our private NPM registry: https://uipath.pkgs.visualstudio.com/_packaging/npm-packages/npm/registry/

### Components

TBD

### Directives

#### `ngLet`

Import it's module and add it to the imports:

```javascript
import { UiNgLetModule } from "@uipath/angular-components";

@NgModule({
  imports: [UiNgLetModule]
})
export class YourModule {}
```

Use it in your templates:

```
<ng-container *ngLet="document$ | async as document">
    ...
</ng-container>
```

### Pipes

TBD

### Services

TBD

### RXJS

#### `asyncOf`

Static operator to avoid breaking the stream when using catchError and `| async`.

Usage example:

```javascript
import { asyncOf } from "@uipath/angular-components";

const result$ = someStream$.pipe(
  catchError(error => asyncOf(error)),
  tap(result => console.log("The stream doesn't break.:)"))
);
```

later the result can be used in the template with `pipe async` and in case of error the UI is rendered correctly

```html
<ng-content *ngLet="result$ | async as result">
  ...
</ng-content>
```

#### `repeatStream`

Static operator that repeats the requested stream indefinately

Usage example:

```javascript
import { repeatStream } from "@uipath/angular-components";


const result$ = repeatStream(
    () => of(Math.random()), 
    1337
  );
 
result$.subscribe(console.log);

// Output: RND --1337ms-- RND --1337ms-- RND --1337ms-- RND ... 1
```

#### `concatJoin`

Static operator that repeats the requested stream indefinately

Usage example:

```javascript
import { concatJoin } from "@uipath/angular-components";


const result$ = concatJoin(
    of(10),
    _myHttpService.get(),
    of(10),
  );
 
result$.subscribe(console.log);

// Output: [10, {Object}, 10]
```
