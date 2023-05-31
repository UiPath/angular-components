import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiFilePickerIntl {
    clickUploadDragDrop$ = of('Click to upload or drag and drop');
    deleteAll$ = of('Delete all');
    fileName$ = of('File name');
    size$ = of('Size');
    type$ = of('Type');

    deleteFile$ = (fileName: string) => of(`Delete file ${fileName}`);
    errorReadingFiles$ = (directory: string, errorName: string, errorMsg: string) => of(`Error reading directory: ${directory}. ${errorName}: ${errorMsg}`);
}
