import {
    SpectatorDirective, SpyObject, byTestId, createDirectiveFactory, createMouseEvent,
} from '@ngneat/spectator';
import { Subject } from 'rxjs';
import { FileReaderService } from './file-reader.service';
import { UiFileDropZoneDirective as SuT } from './ui-file-drop-zone.directive';

describe('UiFileDropZoneDirective', () => {
    let spectator: SpectatorDirective<SuT>;
    let sut: SuT;

    const filesMock$ = new Subject<File[]>();
    const errorMock$ = new Subject<string>();
    const fileReaderService: SpyObject<FileReaderService> = jasmine.createSpyObj(
        'FileReaderService', [ 'processDroppedItems' ]);
        Object.defineProperties(fileReaderService, {
            files$: {
                get: () => filesMock$,
                set: jasmine.createSpy(),
            },
            error$: {
                get: () => errorMock$,
                set: jasmine.createSpy(),
            },
        });

    const filesReceivedOutput = jasmine.createSpy();
    const fileErrorOutput = jasmine.createSpy();
    const filesLoadingOutput = jasmine.createSpy();

    const createDirective = createDirectiveFactory({
        directive: SuT,
        detectChanges: false,
        directiveProviders: [{
            provide: FileReaderService,
            useValue: fileReaderService,
        }],
        template: `
            <div uiFileDropZone
                style="width: 100px;height: 100px;"
                data-testid="custom-drop-zone">
                Custom file drop zone
                <button>Empty button</button>
            </div>
        `,
    });

    const createMockFiles = (ext = '.pdf') => {
        const files: File[] = [];
        for (let i = 0; i < 5; i++) {
            // name the files from 5 to 1 so we can test the sorting
            files.push(new File([], (5 - i) + ext));
        }
        return files;
    };

    beforeEach(() => {
        spectator = createDirective();

        spectator.detectChanges();
        sut = spectator.directive;

        sut.filesReceived.subscribe(filesReceivedOutput);
        sut.fileError.subscribe(fileErrorOutput);
        sut.filesLoading.subscribe(filesLoadingOutput);
    });

    describe('self', () => {
        it('should create', () => {
            expect(sut).toBeTruthy();
        });
    });

    describe('dragging and dropping files', () => {
        it('should add class to drop zone when dragging over', () => {
            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'dragenter');
            spectator.detectChanges();

            expect(spectator.query(byTestId('custom-drop-zone'))).toHaveClass('ui-file-drop-zone-highlight');
        });

        it('should not remove highlight class when dragging over an element inside the dropzone', () => {
            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'dragenter');
            spectator.dispatchMouseEvent('button', 'dragenter');
            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'dragleave');
            spectator.detectChanges();

            expect(spectator.query(byTestId('custom-drop-zone'))).toHaveClass('ui-file-drop-zone-highlight');
        });

        it('should remove highlight when dropping files', () => {
            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'dragenter');
            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'drop');
            spectator.detectChanges();

            expect(spectator.query(byTestId('custom-drop-zone'))).not.toHaveClass('ui-file-drop-zone-highlight');
        });

        it('should call service with files that were dropped', () => {
            const mouseEvent = createMouseEvent('drop');

            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'drop', undefined, undefined, mouseEvent);
            spectator.detectChanges();

            expect(fileReaderService.processDroppedItems).toHaveBeenCalledWith(mouseEvent);
        });

        it('should emit on filesLoading', () => {
            const mouseEvent = createMouseEvent('drop');

            spectator.dispatchMouseEvent(byTestId('custom-drop-zone'), 'drop', undefined, undefined, mouseEvent);
            spectator.detectChanges();

            expect(filesLoadingOutput).toHaveBeenCalledWith(true);

            filesMock$.next(createMockFiles());
            expect(filesLoadingOutput).toHaveBeenCalledWith(false);
        });
    });

    describe('files returned from the service', () => {
        it('should sort the files if sortBy input is present', () => {
            const files = createMockFiles('');
            const sortBy = 'name';
            const sortedFiles = [ '1', '2', '3', '4', '5' ].map(n => new File([], n));

            spectator.setInput({ sortBy });
            filesMock$.next(files);

            spectator.detectChanges();

            expect(filesReceivedOutput).toHaveBeenCalledWith(sortedFiles);
        });

        it('should filter files by extension if accept input is present', () => {
            const accept = '.png';
            const acceptedFiles = createMockFiles(accept);
            const files = createMockFiles().concat(acceptedFiles);

            spectator.setInput({ accept });
            filesMock$.next(files);

            spectator.detectChanges();

            expect(filesReceivedOutput).toHaveBeenCalledWith(acceptedFiles);
        });

        it('should emit error returned from the service', () => {
            const errorText = 'Test error';
            errorMock$.next(errorText);

            spectator.detectChanges();

            expect(fileErrorOutput).toHaveBeenCalledWith(errorText);
        });
    });
});
