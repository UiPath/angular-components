import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { sort } from '@uipath/angular/utilities';
import { Subject } from 'rxjs';
import {
    map,
    takeUntil,
} from 'rxjs/operators';
import { FileReaderService } from './file-reader.service';

// The highlight class gets added to the supplied custom drop zone HTML element,
// so to display properly the component containing it should have that
// class defined in its styles. If no custom drop zone is supplied, the style is applied to
// the input element of this component, and also needs to be described in the css

const DROP_ZONE_HIGHLIGHT_CLASS = 'file-drop-zone-highlight';

@Component({
    selector: 'ui-file-drop-zone',
    templateUrl: './file-drop-zone.component.html',
    styleUrls: [ './file-drop-zone.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ FileReaderService ],
})
export class UiFileDropZoneComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() disabled?: boolean;
    // key of File and '-' prefix for descending sort
    @Input() sortBy?: string;
    @Input() single?: boolean;
    // The HTML element that will act as a drop zone
    // The drop events and the dragover highlight will be applied to this element
    // or the <input> element of this component if customDropZone is not supplied
    @Input() set customDropZone(customDropZone: HTMLElement) {
        this._dropZone = customDropZone;
    }
    // comma-separated extension list, example: '.jpg,.png,.pdf'
    @Input() set accept(value: string | undefined) {
        if (value) {
            this._accept = value.split(',')
                .map(v => v.trim().toLowerCase())
                .filter(v => !!v);
        }
    }
    // if not provided, input is removed from tab order and aria is disabled
    @Input() ariaLabel?: string;

    @Output() filesReceived = new EventEmitter<File[]>();
    @Output() filesLoading = new EventEmitter<boolean>();
    @Output() fileError = new EventEmitter<string | null>();

    @ViewChild('uploadInput', {
        read: ElementRef,
        static: true,
    }) defaultDropZone!: ElementRef;

    private _accept: string[] = [];
    private _destroyed$ = new Subject<void>();
    private _dropZone!: HTMLElement;

    constructor(
        private readonly _fileReaderService: FileReaderService,
    ) { }

    @HostListener('drop', ['$event'])
    drop(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (this.disabled) {
            return;
        }
        this._clearDropZoneHighlight();
        this.filesLoading.next(true);
        this._fileReaderService.processDroppedItems(e);
    }

    @HostListener('dragover', ['$event'])
    dragover(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.disabled) {
            this._highlightDropZone();
        }
    }

    @HostListener('dragleave')
    dragleave() {
        if (!this.disabled) {
            this._clearDropZoneHighlight();
        }
    }

    click() {
        this.defaultDropZone.nativeElement.click();
    }

    ngOnInit(): void {
        this._fileReaderService.files$
            .pipe(
                map(unsortedFiles => this._sortAndFilter(unsortedFiles)),
                takeUntil(this._destroyed$),
            )
            .subscribe(files => this._emitFiles(files));

        this._fileReaderService.error$
            .pipe(
                takeUntil(this._destroyed$),
            )
            .subscribe(err => this.fileError.emit(err));
    }

    ngAfterViewInit(): void {
        if (!this._dropZone) {
            this._dropZone = this.defaultDropZone.nativeElement;
        }
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    onBrowseFiles($event: Event) {
        const filesReceived = ($event.target as HTMLInputElement).files;
        if (!filesReceived) {
            return;
        }
        this._fileReaderService.processFilesFromFileList(filesReceived);
    }

    private _highlightDropZone() {
        if (!this._dropZone || this._dropZone.classList.contains(DROP_ZONE_HIGHLIGHT_CLASS)) {
            return;
        }
        this._dropZone.classList.add(DROP_ZONE_HIGHLIGHT_CLASS);
    }

    private _clearDropZoneHighlight() {
        if (!this._dropZone) {
            return;
        }
        this._dropZone.classList.remove(DROP_ZONE_HIGHLIGHT_CLASS);
    }

    private _emitFiles(files: File[]) {
        this.fileError.emit(null);
        this.filesReceived.emit(files);
        this.filesLoading.emit(false);
        // force change callback on input to get called
        // for consecutive selections of the same files
        this.defaultDropZone.nativeElement.value = null;
    }

    private _sortAndFilter(files: File[]) {
        files = files.filter(f => this._isAcceptedExtension(f.name));
        return this.sortBy ? sort(files, this.sortBy, false) : files;
    }

    private _getFileExtension(fileName: string) {
        const fileNameParts = fileName.split('.');
        const extension = fileNameParts.length > 1 ? fileNameParts.slice(-1)[0] : '';
        return `.${extension.toLowerCase()}`;
    }

    private _isAcceptedExtension(fileName: string) {
        if (!this._accept.length) {
            return true;
        }

        const fileExtension = this._getFileExtension(fileName);
        return this._accept.includes(fileExtension);
    }
}
