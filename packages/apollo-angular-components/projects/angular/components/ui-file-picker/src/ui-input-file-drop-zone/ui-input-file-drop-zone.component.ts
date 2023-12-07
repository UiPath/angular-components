import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FileReaderError,
    UiFileDropZoneDirective,
    sortAndFilter,
} from '@uipath/angular/directives/ui-file-drop-zone';
import { Subject } from 'rxjs';

@Component({
    selector: 'ui-input-file-drop-zone',
    templateUrl: './ui-input-file-drop-zone.component.html',
    styleUrls: [ './ui-input-file-drop-zone.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ CommonModule ],
    hostDirectives: [{
        directive: UiFileDropZoneDirective,
        inputs: [ 'sortBy', 'accept', 'disabled: disableDropZone' ],
        // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
        outputs: [ 'filesReceived', 'filesLoading', 'fileError' ],
    }],
})
export class UiInputFileDropZoneComponent implements OnDestroy {
    @Input() single?: boolean;
    // if not provided, input is removed from tab order and aria is disabled
    @Input() ariaLabel?: string;
    @Input() disabled?: boolean;
    // key of File and '-' prefix for descending sort
    @Input() sortBy?: string;
    // comma-separated extension list, example: '.jpg,.png,.pdf'
    @Input() set accept(value: string | undefined) {
        if (value) {
            this._accept = value.split(',')
                .map(v => v.trim().toLowerCase())
                .filter(v => !!v);
        }
    }
    // disable UiFileDropZoneDirective, [disabled] component input will not also disable the directive
    @Input() disableDropZone = false;

    @Output() filesReceived = new EventEmitter<File[]>();
    @Output() filesLoading = new EventEmitter<boolean>();
    @Output() fileError = new EventEmitter<FileReaderError | null>();

    @ViewChild('uploadInput', {
        read: ElementRef,
        static: false,
    }) inputElement?: ElementRef;

    protected _accept: string[] = [];
    private _destroyed$ = new Subject<void>();

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    click() {
        this.inputElement?.nativeElement.click();
    }

    onBrowseFiles($event: Event) {
        const filesReceived = ($event.target as HTMLInputElement).files;
        if (!filesReceived) {
            return;
        }

        this.filesLoading.next(true);
        const unsortedFiles: File[] = [];
        for (let i = 0; i < filesReceived.length; i++) {
            const file = filesReceived.item(i);
            if (file?.size) {
                unsortedFiles.push(file);
            }
        }

        const sortedFiles = sortAndFilter(unsortedFiles, this.sortBy, this._accept);
        this._emitFiles(sortedFiles);
    }

    protected _emitFiles(files: File[]) {
        this.fileError.emit(null);
        this.filesReceived.emit(files);
        this.filesLoading.emit(false);
        // force change callback on input to get called
        // for consecutive selections of the same files
        if (this.inputElement) {
            this.inputElement.nativeElement.value = null;
        }
    }

}
