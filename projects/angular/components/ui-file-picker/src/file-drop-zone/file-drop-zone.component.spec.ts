import {
    byTestId,
    createComponentFactory,
    Spectator,
    SpyObject,
 createMouseEvent,
} from '@ngneat/spectator';
import { Subject } from 'rxjs';
import {
    a11y,
    axe,
} from 'projects/angular/axe-helper';

import { UiFileDropZoneComponent as SuT } from './file-drop-zone.component';
import { FileReaderService } from './file-reader.service';

describe('FileDropZoneComponent:', () => {
    let spectator: Spectator<SuT>;
    let sut: SuT;
    let fileReaderService: SpyObject<FileReaderService>;
    const filesMock$ = new Subject<File[]>();
    const errorMock$ = new Subject<string>();

    const filesReceivedOutput = jasmine.createSpy();
    const fileErrorOutput = jasmine.createSpy();

    const createComponent = createComponentFactory({
        component: SuT,
        detectChanges: false,
        componentMocks: [ FileReaderService ],
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
        spectator = createComponent();

        fileReaderService = spectator.inject(FileReaderService, true);
        spyOnProperty(fileReaderService, 'files$').and.returnValue(filesMock$);
        spyOnProperty(fileReaderService, 'error$').and.returnValue(errorMock$);
        spectator.detectChanges();
        sut = spectator.component;

        sut.filesReceived.subscribe(filesReceivedOutput);
        sut.fileError.subscribe(fileErrorOutput);
    });

    describe('self', () => {
        it('should create', () => {
            spectator.detectChanges();
            expect(sut).toBeTruthy();
        });

        a11y.suite((runOptions) => {
            a11y.it('should have no violations', async () => {
                expect(await axe(spectator.fixture.nativeElement, runOptions)).toHaveNoViolations();
            });
        });
    });

    describe('dropping or browsing files', () => {
        it('should display file over effect when dragged over', () => {
            const mouseEvent = createMouseEvent('dragover');
            spectator.dispatchMouseEvent(byTestId('file-input'), 'dragover', undefined, undefined, mouseEvent);
            spectator.detectChanges();

            expect(spectator.query('input')).toHaveClass('file-drop-zone-highlight');
        });

        it('should call service with files that were dropped', () => {
            const mouseEvent = createMouseEvent('drop');

            spectator.dispatchMouseEvent(byTestId('file-input'), 'drop', undefined, undefined, mouseEvent);
            spectator.detectChanges();

            expect(fileReaderService.processDroppedItems).toHaveBeenCalledWith(mouseEvent);
        });

        it('should call service with files that were browsed by clicking the input', () => {
            const input = spectator.query(byTestId('file-input')) as HTMLInputElement;
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([''], 'test-file.pdf'));
            input.files = dataTransfer.files;

            input.dispatchEvent(new InputEvent('change'));

            expect(fileReaderService.processFilesFromFileList).toHaveBeenCalledTimes(1);
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

        it('should display the error returned from the service', () => {
            const errorText = 'Test error';
            errorMock$.next(errorText);

            spectator.detectChanges();

            expect(fileErrorOutput).toHaveBeenCalledWith(errorText);
        });

    });
});

