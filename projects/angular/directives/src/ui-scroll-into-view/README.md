# `uiScrollIntoView`

This directive scrolls the decorated element into view. It wraps `scroll-into-view-if-needed` to achieve the desired functionality.

## Usage

```typescript
import { UiScrollIntoViewModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiScrollIntoViewModule]
})
export class YourModule {}
```

```html
<mat-card [uiScrollIntoView]="myCondition">
    <p>Some warning message!</p>
</mat-card>
```

## API

```typescript
@Input()
boundary: 'parent' | Element;

@Input()
uiScrollIntoView: boolean;
```
