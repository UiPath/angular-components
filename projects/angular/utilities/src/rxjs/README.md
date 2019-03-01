# RXJS Utilities

## `asyncOf`

Static operator to avoid breaking the stream when using catchError and `| async`.

```typescript
import { asyncOf } from '@uipath/angular/utilities';

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

## `repeatStream`

Static operator that repeats the requested stream indefinately

```typescript
import { repeatStream } from '@uipath/angular/utilities';


const result$ = repeatStream(
    () => of(Math.random()),
    1337
  );

result$.subscribe(console.log);

// Output: RND --1337ms-- RND --1337ms-- RND --1337ms-- RND ...
```

## `concatJoin`

Static operator that repeats the requested stream indefinately

```typescript
import { concatJoin } from '@uipath/angular/utilities';


const result$ = concatJoin(
    of(10),
    _myHttpService.get(),
    of(10),
  );

result$.subscribe(console.log);

// Output: [10, {Object}, 10]
```
