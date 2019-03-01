# `uiClickOutside`

This directive emits an event when a click occurs outside of the decorated element.

## Usage

Declaration import:
```typescript
import { UiClickOutsideModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiClickOutsideModule]
})
export class YourModule {}
```

Register services:
```typescript
import { UiClickOutsideModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiClickOutsideModule.forRoot()]
})
export class AppModule {}
```

```html
<input (uiClickOutside)="outsideClickCallback($event)" class="form-control" />
```

## API

``` typescript
@Output()
uiClickOutside: Observable<MouseEvent>;
```
