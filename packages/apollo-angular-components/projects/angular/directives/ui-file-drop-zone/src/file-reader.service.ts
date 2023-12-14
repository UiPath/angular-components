import {
    Injectable,
    NgZone,
    OnDestroy,
} from '@angular/core';
import {
    Observable,
    ReplaySubject,
    Subject,
    forkJoin,
    of,
} from 'rxjs';
import {
    catchError,
    map,
    take,
    takeUntil,
} from 'rxjs/operators';

export interface FileReaderError {
    entryName: string;
    error: string;
    errorMessage: string;
}

@Injectable()
export class FileReaderService implements OnDestroy {

    private readonly _fileError$ = new Subject<FileReaderError>();
    private readonly _files$ = new ReplaySubject<File[]>(1);
    private readonly _destroyed$ = new Subject<void>();

    constructor(
        private readonly _ngZone: NgZone,
    ) { }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    get files$() {
        return this._files$.asObservable();
    }

    get error$() {
        return this._fileError$;
    }

    processDroppedItems(e: DragEvent) {
        const items = e.dataTransfer?.items;
        if (!items) {
            return;
        }
        if (this._isFolderUploadSupported(items)) {
            this._processDroppedFolders(items);
        } else {
            this.processFilesFromFileList(e.dataTransfer.files, true);
        }
    }

    processFilesFromFileList(filesReceived: FileList, ignoreFoldersOrEmptyFiles = false) {
        if (!filesReceived) {
            return;
        }

        const files: File[] = [];
        for (let i = 0; i < filesReceived.length; i++) {
            const file = filesReceived.item(i);
            if (!file) {
                continue;
            }
            // Checking the file size is the only way to tell if
            // one of the items is a folder at this stage,
            // so we want to avoid both folders and empty files here
            const containsFoldersOrEmptyFiles = !file.size;
            if (containsFoldersOrEmptyFiles && ignoreFoldersOrEmptyFiles) {
                continue;
            }
            files.push(file);
        }

        this._files$.next(files);
    }

    private _processDroppedFolders(items: DataTransferItemList) {
        const fileObservables: Observable<File[]>[] = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (!item) {
                continue;
            }
            fileObservables.push(this._traverseFileTree(item));
        }
        forkJoin(fileObservables).pipe(
            catchError((err) => {
                this._fileError$.next(err);
                return of([] as File[][]);
            }),
            takeUntil(this._destroyed$),
        )
            .subscribe(files => this._ngZone.run(() => this._files$.next(files.reduce((acc, current) => acc.concat(current), []))));
    }

    private _isFolderUploadSupported(items: DataTransferItemList) {
        if (items?.[0]?.webkitGetAsEntry?.()) {
            return true;
        }
        return false;
    }

    private _addFileFromEntry(entry: FileSystemFileEntry): Observable<File> {
        return new Observable<File>(emitter => {
            entry.file(f => {
                emitter.next(f);
                emitter.complete();
            });
        });
    }

    private _traverseFileTree(entry: FileSystemEntry): Observable<File[]> {
        if (entry.isFile) {
            return this._addFileFromEntry(entry as FileSystemFileEntry).pipe(
                map(f => ([ f ])),
            );
        }
        return new Observable<File[]>(emitter => {
            const dirReader = (entry as FileSystemDirectoryEntry).createReader();
            let entries: FileSystemEntry[] = [];
            const readEntries = () => {
                dirReader.readEntries((results) => {
                    if (!results.length) {
                        // finished reading all entries in the directory
                        if (entries.length > 0) {
                            // folder has content
                            this._readAndEmitEntries(entries)
                                .pipe(take(1))
                                .subscribe(files => {
                                    emitter.next(files);
                                    emitter.complete();
                                });
                        } else {
                            // folder is empty
                            emitter.next([]);
                            emitter.complete();
                        }
                    } else {
                        // Chrome only reads max 100 entries in one call, that's why we need to
                        // read every directory more than once
                        entries = entries.concat(results);
                        readEntries();
                    }
                }, (err) => {
                    emitter.error({
                        entryName: entry.name,
                        error: err.name,
                        errorMessage: err.message,
                    });
                });
            };
            readEntries();
        });
    }

    private _readAndEmitEntries(entries: FileSystemEntry[]) {
        const entryObservables = entries.map(entry => this._traverseFileTree(entry));
        return forkJoin(entryObservables).pipe(
            map(filesMatrix => filesMatrix.reduce((acc, current) => acc.concat(current), [])),
            takeUntil(this._destroyed$),
        );
    }
}
