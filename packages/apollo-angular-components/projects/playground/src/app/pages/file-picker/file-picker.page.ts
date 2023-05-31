import {
 ChangeDetectionStrategy, Component,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'ui-app-file-picker',
    templateUrl: './file-picker.page.html',
    styleUrls: ['./file-picker.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class FilePickerPageComponent {
    customDropZoneFiles$ = new BehaviorSubject<string>('');
    hiddenSummaryFiles$ = new BehaviorSubject<string>('');

    addFiles(files: File[]) {
        this.customDropZoneFiles$.next(files.map(file => file.name).join(', '));
    }

    onFilesChanged(files: File[]) {
      this.hiddenSummaryFiles$.next(files.map(f => f.name + ` (${f.size})`).join(', '));
    }
  }
