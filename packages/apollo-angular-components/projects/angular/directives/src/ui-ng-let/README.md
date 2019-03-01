# `ngLet`

This directive enables stream value assignment within the template. Usually helps when you want to render the DOM before the stream emits a value.

## Usage

```typescript
import { UiNgLetModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiNgLetModule]
})
export class YourModule {}
```

```html
<ng-container *ngLet="document$ | async as document">
    ...
</ng-container>
```
