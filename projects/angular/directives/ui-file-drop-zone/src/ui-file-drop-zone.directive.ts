import {
    AfterViewInit,
    Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output,
} from '@angular/core';
import {
    Subject, map, takeUntil,
} from 'rxjs';
import { sortAndFilter } from './file-drop-zone.utils';
import {
    FileReaderError,
    FileReaderService,
} from './file-reader.service';

// The highlight class gets added to the host HTML element,
// so to display properly the component containing it
// should have that class defined in its styles.
const DROP_ZONE_HIGHLIGHT_CLASS = 'ui-file-drop-zone-highlight';

/**
 * A directive that turns any html element into a file drop zone
 * - does not use a dynamically created input element and only reacts on file drag and drop
 * - adds a css class to the host element when files are being dragged over
 *
 * @export
 */
@Directive({
    selector: '[uiFileDropZone]',
    providers: [ FileReaderService ],
    standalone: true,
})
export class UiFileDropZoneDirective implements OnInit, AfterViewInit, OnDestroy {
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

    @Output() filesReceived = new EventEmitter<File[]>();
    @Output() filesLoading = new EventEmitter<boolean>();
    @Output() fileError = new EventEmitter<FileReaderError | null>();

    private _accept: string[] = [];
    private _dragCount = 0;
    private _dropZone?: HTMLElement;
    private _destroyed$ = new Subject<void>();

    constructor(
        private readonly _element: ElementRef,
        protected readonly _fileReaderService: FileReaderService,
    ) { }

    @HostListener('drop', ['$event'])
    drop(e: DragEvent) {
        if (this.disabled) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        this._dragCount -= 1;
        this._clearDropZoneHighlight();
        this.filesLoading.next(true);
        this._fileReaderService.processDroppedItems(e);
    }

    @HostListener('dragover', ['$event'])
    dragover(e: DragEvent) {
        // preventDefault is needed to enable drop event
        e.preventDefault();
    }

    @HostListener('dragenter')
    dragenter() {
        if (!this.disabled) {
            this._dragCount += 1;
            this._highlightDropZone();
        }
    }

    @HostListener('dragleave')
    dragleave() {
        if (this.disabled) {
            return;
        }
        this._dragCount -= 1;
        if (this._dragCount === 0) {
            this._clearDropZoneHighlight();
        }
    }

    ngOnInit(): void {
        this._fileReaderService.files$
            .pipe(
                map(unsortedFiles => sortAndFilter(unsortedFiles, this.sortBy, this._accept)),
                takeUntil(this._destroyed$),
            )
            .subscribe(files => this._emitFiles(files));

        this._fileReaderService.error$
            .pipe(
                takeUntil(this._destroyed$),
            )
            .subscribe(err => this.fileError.emit(err));
    }

    ngAfterViewInit() {
        this._dropZone = this._element.nativeElement;
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    protected _emitFiles(files: File[]) {
        this.fileError.emit(null);
        this.filesReceived.emit(files);
        this.filesLoading.emit(false);
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
}
