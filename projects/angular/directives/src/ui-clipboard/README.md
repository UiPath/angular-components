# `uiClipboard`

This directive copies the value from the associated input to the user clipboard. This wrappes `clipboard`.

## Usage

```typescript
import { UiClipboardModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiClipboardModule]
})
export class YourModule {}
```

```html
    <input #myInput />
    <button [uiClipboard]="myInput"
        (clipboardSuccess)="onClipboardCopy($event)">
    </button>
```

## API

```typescript
@Input()
uiClipboard: Element;

@Output()
clipboardSuccess: EventEmitter<Clipboard.Event>;

@Output()
clipboardError: EventEmitter<Clipboard.Event>;
```
