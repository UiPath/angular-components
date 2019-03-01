# `uiAutofocus`

This directive will autofocus the decorated element, very useful in forms.

## Usage

```typescript
import { UiAutofocusModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiAutofocusModule]
})
export class YourModule {}
```

```html
<input [uiAutofocus] class="form-control" />
```

## API

``` typescript
@Input()
uiAutofocus: boolean;

@Input()
refocus: boolean;

@Input()
selectionLocation: 'start' | 'end';
```
