import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    Spectator,
    byTestId,
    createComponentFactory,
} from '@ngneat/spectator';
import {
    LetModule,
    PushModule,
} from '@ngrx/component';
import { UiGridModule } from '@uipath/angular/components/ui-grid';
import { UiPipeModule } from '@uipath/angular/pipes';
import {
    a11y,
    axe,
} from 'projects/angular/axe-helper';
import { FileReaderError } from '@uipath/angular/directives/ui-file-drop-zone';
import { UiInputFileDropZoneComponent } from './ui-input-file-drop-zone/ui-input-file-drop-zone.component';
import { UiFilePickerComponent as SuT } from './ui-file-picker.component';

describe('UiFilePickerComponent:', () => {
    let spectator: Spectator<SuT>;
    let sut: SuT;

    let filesChangedOutput = jasmine.createSpy();

    const createMockFiles = (ext = '.pdf') => {
        const files: File[] = [];
        for (let i = 0; i < 5; i++) {
            // name the files from 5 to 1 so we can test the sorting
            files.push(new File([], (5 - i) + ext));
        }
        return files;
    };

    const createComponent = createComponentFactory({
        component: SuT,
        detectChanges: false,
        imports: [
            UiGridModule,
            UiPipeModule,
            LetModule,
            PushModule,
            MatIconModule,
            MatProgressSpinnerModule,
            MatFormFieldModule,
            MatTooltipModule,
        ],
    });

    beforeEach(() => {
        spectator = createComponent();

        sut = spectator.component;

        filesChangedOutput = jasmine.createSpy();
        sut.filesChanged.subscribe(filesChangedOutput);

        const sortBy = 'name';
        spectator.setInput({ sortBy });

        spectator.detectChanges();
    });

    describe('self', () => {
        it('should create', () => {
            expect(sut).toBeTruthy();
        });

        a11y.suite((runOptions) => {
            a11y.it('should have no violations', async () => {
                expect(await axe(spectator.fixture.nativeElement, runOptions)).toHaveNoViolations();
            });
        });
    });

    describe('empty state', () => {
        it('should display large input', () => {
            spectator.detectChanges();
            const inputWrapper = spectator.query('.upload-input-wrapper');

            expect(inputWrapper).toHaveClass('large');
        });

        it('should be disabled when input "disabled" is true', () => {
            spectator.setInput({ disabled: true });
            spectator.detectChanges();
            expect(spectator.query('div .upload-wrapper.disabled')).toBeTruthy();
        });
    });

    describe('file grid state', () => {
        a11y.suite((runOptions) => {
            a11y.it('should have no violations', async () => {
                expect(await axe(spectator.fixture.nativeElement, runOptions)).toHaveNoViolations();
            });
        });

        it('should display spinner when files are loading', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesLoading.next(true);
            spectator.detectChanges();

            const spinner = spectator.query('mat-progress-spinner');
            expect(spinner).toBeTruthy();
        });

        it('should display error from file reader service', () => {
            const testError: FileReaderError = {
                entryName: 'dir-1',
                error: 'test error',
                errorMessage: 'test error message',
            };

            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.fileError.next(testError);
            spectator.detectChanges();

            const errorElement = spectator.query('mat-error');
            expect(errorElement).toBeTruthy();
            expect(errorElement).toHaveText('Error reading directory: dir-1. test error: test error message');
        });

        it('should not display large input', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(createMockFiles());
            spectator.detectChanges();
            const inputWrapper = spectator.query('.upload-input-wrapper');

            expect(inputWrapper).not.toHaveClass('large');
        });

        it('should display and emit all files from the drop zone in the grid', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(createMockFiles());
            spectator.detectChanges();
            const gridRows = spectator.queryAll('.ui-grid-row');

            expect(gridRows).toHaveLength(5);
            expect(filesChangedOutput).toHaveBeenCalledTimes(1);
            expect(filesChangedOutput).toHaveBeenCalledWith(createMockFiles());
        });

        it('should add newly dropped files to the grid and emit the new file list', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(createMockFiles());
            spectator.detectChanges();

            const newFile = new File([], '6.png');
            fileDropZone?.filesReceived.next([ newFile ]);
            spectator.detectChanges();
            const gridRows = spectator.queryAll('.ui-grid-row');

            expect(gridRows).toHaveLength(6);
            expect(filesChangedOutput).toHaveBeenCalledTimes(2);
            expect(filesChangedOutput).toHaveBeenCalledWith(createMockFiles().concat([ newFile ]));
        });

        it('should not add a file if it is a duplicate', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(createMockFiles());
            spectator.detectChanges();

            const newFile = new File([], '1.pdf');
            fileDropZone?.filesReceived.next([ newFile ]);
            spectator.detectChanges();

            const gridRows = spectator.queryAll('.ui-grid-row');
            expect(gridRows).toHaveLength(5);
        });
    });

    describe('deleting files', () => {
        it('should remove the grid, return to the "large" state, and emit an empty file list when clicking Delete All', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(createMockFiles());
            spectator.detectChanges();

            spectator.click('.delete-all-button');
            spectator.detectChanges();

            const gridRows = spectator.queryAll('.ui-grid-row');
            const inputWrapper = spectator.query('.upload-input-wrapper');

            expect(gridRows).toHaveLength(0);
            expect(inputWrapper).toHaveClass('large');
            expect(filesChangedOutput).toHaveBeenCalledTimes(2);
            expect(filesChangedOutput).toHaveBeenCalledWith(createMockFiles());
            expect(filesChangedOutput).toHaveBeenCalledWith([]);
        });

        it('should remove the correct row and emit the new file list when clicking its delete button', () => {
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(createMockFiles());
            spectator.detectChanges();

            const deleteButtons = spectator.queryAll(byTestId('delete-file-button'));
            spectator.click(deleteButtons[0]);
            spectator.detectChanges();

            const fileNames = spectator.queryAll('.ui-grid-row')
                .map(gridRow => gridRow.querySelector('.ui-grid-cell-content')?.textContent)
                .join(', ');

            expect(fileNames).toBe('2.pdf, 3.pdf, 4.pdf, 5.pdf');
            expect(filesChangedOutput).toHaveBeenCalledTimes(2);
            expect(filesChangedOutput).toHaveBeenCalledWith(createMockFiles());
            expect(filesChangedOutput).toHaveBeenCalledWith(createMockFiles().slice(0, 4));
        });
    });

    describe('set files from parent component', () => {
        it('should add files to the grid', () => {
            const files = [ new File([], '1.pdf'), new File([], '2.jpg') ];
            spectator.setInput('files', files);

            const gridRows = spectator.queryAll('.ui-grid-row');
            expect(gridRows).toHaveLength(2);
        });

        it('should not emit on filesChanged', () => {
            const files = [ new File([], '1.pdf'), new File([], '2.jpg') ];
            spectator.setInput('files', files);

            expect(filesChangedOutput).not.toHaveBeenCalled();
        });
    });

    describe('files returned from the service', () => {
        it('should sort the files if sortBy input is present', () => {
            const files = createMockFiles('');
            const sortBy = 'name';
            const sortedFiles = [ '1', '2', '3', '4', '5' ].map(n => new File([], n));

            spectator.setInput({ sortBy });
            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.filesReceived.next(files);

            spectator.detectChanges();

            expect(filesChangedOutput).toHaveBeenCalledWith(sortedFiles);
        });

        it('should display the error returned from the service', () => {
            const testError: FileReaderError = {
                entryName: 'dir-1',
                error: 'test error',
                errorMessage: 'test error message',
            };
            const errorSubscription = jasmine.createSpy();
            sut.fileError$.subscribe(errorSubscription);

            const fileDropZone = spectator.query<UiInputFileDropZoneComponent>(UiInputFileDropZoneComponent);
            fileDropZone?.fileError.next(testError);
            spectator.detectChanges();

            expect(errorSubscription).toHaveBeenCalledWith('Error reading directory: dir-1. test error: test error message');
        });

    });
});

