# `uiDragAndDropFile`

This directive enables a drag and drop area and associates it to a file input.

## Usage

```typescript
import { UiDragAndDropModule } from '@uipath/angular/directives';

@NgModule({
  imports: [UiDragAndDropModule]
})
export class YourModule {}
```

```html
<div uiDragAndDropFile
      [fileBrowseRef]="browseTrigger._getHostElement()"
      (fileChange)="onFileChangeCallback($event)">
    <button #browseTrigger>
      Browse
    </button>
</div>
```

## API

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
