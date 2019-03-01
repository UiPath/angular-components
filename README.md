# UiPath - Angular Components Library

Library of Angular components, directives, pipes, services or any other common stuff accros Angular apps in UiPath.

## Documentation

### Install

```
$ npm install @uipath/angular
```

### Publish a new version

1. set new version in `projects/angular/package.json`
2. run `npm run package` - this will create a new `tgz` bundle in `dist/angular/` folder
3. run `npm publish ./dist/angular/uipath-angular-<new package version>.tgz`

This will publish the new version in our private NPM registry: https://uipath.pkgs.visualstudio.com/_packaging/npm-packages/npm/registry/

### Components

TBD

### Directives

#### `ngLet` - enables stream value assignment within the template

Import its module and add it to the imports:

```typescript
import { UiNgLetModule } from "@uipath/angular";

@NgModule({
  imports: [UiNgLetModule]
})
export class YourModule {}
```

Use it in your templates:

```html
<ng-container *ngLet="document$ | async as document">
    ...
</ng-container>
```

#### `uiAutofocus` - autofocuses the marked element

Import its module and add it to the imports:

```typescript
import { UiAutofocusModule } from "@uipath/angular";

@NgModule({
  imports: [UiAutofocusModule]
})
export class YourModule {}
```

Use it in your templates:

```html
<input [uiAutofocus] class="form-control" />
```

API:

``` typescript
@Input()
uiAutofocus: boolean;

@Input()
refocus: boolean;

@Input()
selectionLocation: 'start' | 'end';
```

#### `uiClickOutside` - emits when a click occurs outside of the marked element

Import its module and add it to the imports:

```typescript
import { UiClickOutsideModule } from "@uipath/angular";

@NgModule({
  imports: [UiClickOutsideModule]
})
export class YourModule {}
```

Use it in your templates:

```html
<input (uiClickOutside)="outsideClickCallback($event)" class="form-control" />
```

API:

``` typescript
@Output()
uiClickOutside: Observable<MouseEvent>;
```

#### `uiDragAndDropFile` - enables a drag and drop area and associates it to a file input

Import its module and add it to the imports:

```typescript
import { UiDragAndDropModule } from "@uipath/angular";

@NgModule({
  imports: [UiDragAndDropModule]
})
export class YourModule {}
```

Use it in your templates:

```html
<div uiDragAndDropFile
      [fileBrowseRef]="browseTrigger._getHostElement()"
      (fileChange)="onFileChangeCallback($event)">
    <button #browseTrigger>
      Browse
    </button>
</div>
```

API:

```typescript
@Input()
fileType: string;

@Input()
fileBrowseRef: Element;

@Input()
fileClearRef: Element;

@Input()
multiple: boolean;

@Output()
fileChange: EventEmitter<File[]>;

@Output()
fileClear: EventEmitter;
```

#### `uiScrollIntoView` - scrolls the element into view

Import its module and add it to the imports:

```typescript
import { UiScrollIntoViewModule } from "@uipath/angular";

@NgModule({
  imports: [UiScrollIntoViewModule]
})
export class YourModule {}
```

Use it in your templates:

```html
<mat-card [uiScrollIntoView]="myCondition">
    <p>Some warning message!</p>
</mat-card>
```

API:

```typescript
@Input()
boundary: 'parent' | Element;

@Input()
uiScrollIntoView: boolean;
```

### Pipes

TBD

### Services

TBD

### RXJS

#### `asyncOf`

Static operator to avoid breaking the stream when using catchError and `| async`.

Usage example:

```typescript
import { asyncOf } from "@uipath/angular";

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

```typescript
import { repeatStream } from "@uipath/angular";


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

```typescript
import { concatJoin } from "@uipath/angular";


const result$ = concatJoin(
    of(10),
    _myHttpService.get(),
    of(10),
  );

result$.subscribe(console.log);

// Output: [10, {Object}, 10]
```
