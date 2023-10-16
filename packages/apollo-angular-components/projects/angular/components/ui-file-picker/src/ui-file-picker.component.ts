import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    BehaviorSubject,
    ReplaySubject,
    Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    getFileExtension,
    sort,
} from '@uipath/angular/utilities';
import { UiFileDropZoneComponent } from './file-drop-zone/file-drop-zone.component';
import { UiFilePickerIntl } from './ui-file-picker.intl';

@Component({
    selector: 'ui-file-picker',
    templateUrl: './ui-file-picker.component.html',
    styleUrls: [ './ui-file-picker.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFilePickerComponent implements OnInit, OnDestroy {

    // comma-separated extension list, example: '.jpg,.png,.pdf'
    @Input() accept?: string;
    @Input() disabled?: boolean;
    @Input() hideSummaryAfterFilesSelection?: boolean;
    @Input() secondaryMessage?: string;
    // key of File and '-' prefix for descending sort
    @Input() sortBy?: string;
    @Input() single?: boolean;

    @Input() set files(files: File[]) {
        if (files) {
            this.displayedFiles$.next(files);
        }
    }

    @Output() filesChanged = new EventEmitter<File[]>();

    @HostBinding('class.ui-file-picker') cls = true;

    @ViewChild('fileDropzone', { read: UiFileDropZoneComponent }) fileDropZone?: UiFileDropZoneComponent;
    @ViewChild('deleteAll', { read: ElementRef }) deleteAllButton!: ElementRef;

    files$ = new ReplaySubject<File[]>(1);
    fileError$ = new BehaviorSubject<string | null>(null);
    filesLoading$ = new BehaviorSubject<boolean>(false);
    displayedFiles$ = new BehaviorSubject<File[]>([]);
    deleteButtonSize = 0;

    getFileExtension = getFileExtension;

    private _destroyed$ = new Subject<void>();

    constructor(
        readonly intl: UiFilePickerIntl,
    ) { }

    ngOnInit(): void {
        this.files$.pipe(
            takeUntil(this._destroyed$),
        ).subscribe(files => {
            this.displayedFiles$.next(files);
            this.filesChanged.emit(files);
        });
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    addFiles(files: File[]): void {
        const current = this.displayedFiles$.value;
        const isFileAlreadyListed = (file: File) => current.find(existingFile => this._isSameFile(existingFile, file));
        const unique = files.filter(f => !isFileAlreadyListed(f));
        const all = current.concat(unique);
        const sorted = this._sortFiles(all);

        this.files$.next(sorted);
    }

    removeFile(file: File) {
        const filteredFiles = this.displayedFiles$.value.filter(f => !this._isSameFile(f, file));
        this.files$.next(filteredFiles);
    }

    clearAll() {
        this.files$.next([]);
    }

    detectDeleteButtonSize() {
        // this is needed to set minimum width on the "Size" grid column
        // and stop it from being hidden by the delete all button
        this.deleteButtonSize = this.deleteAllButton ?
            this.deleteAllButton.nativeElement.getBoundingClientRect().width : 0;
    }

    onBrowseFilesClick() {
        this.fileDropZone?.click();
    }

    displayLoadingIndicator(loading: boolean) {
        this.filesLoading$.next(loading);
    }

    handleFileError(error: string | null) {
        this.fileError$.next(error);
    }

    private _sortFiles(files: File[]) {
        return this.sortBy ? sort(files, this.sortBy, false) : files;
    }

    private _isSameFile(file1: File, file2: File) {
        return file1.name === file2.name &&
            file1.size === file2.size;
    }
}
