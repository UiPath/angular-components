import {
    byTestId,
    createComponentFactory,
    Spectator,
} from '@ngneat/spectator';
import {
    a11y,
    axe,
} from 'projects/angular/axe-helper';

import { UiFileDropZoneDirective } from '@uipath/angular/directives/ui-file-drop-zone';
import { UiInputFileDropZoneComponent as SuT } from './ui-input-file-drop-zone.component';

describe('UiFileDropZoneComponent:', () => {
    let spectator: Spectator<SuT>;
    let sut: SuT;

    const filesReceivedOutput = jasmine.createSpy();
    const fileErrorOutput = jasmine.createSpy();

    const createComponent = createComponentFactory({
        component: SuT,
        detectChanges: false,
        overrideComponents: [ [
            SuT, {
                remove: { hostDirectives: [ {
                    directive: UiFileDropZoneDirective,
                    inputs: [ 'sortBy', 'accept', 'disabled: disableDropZone' ],
                    // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
                    outputs: [ 'filesReceived', 'filesLoading', 'fileError' ],
                } ] },
            },
        ] ],
    });

    beforeEach(() => {
        spectator = createComponent();

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

    it('should emit files that were browsed by clicking the input', () => {
        const file = new File([], 'test-file.pdf');
        Object.defineProperty(file, 'size', { value: 1024 });

        mockChooseFileFromFilePicker([ file ]);

        expect(filesReceivedOutput).toHaveBeenCalledTimes(1);
        expect(filesReceivedOutput).toHaveBeenCalledWith([ file ]);
    });

    it('should clear input value after emitting files', () => {
        const file = new File([], 'test-file.pdf');
        Object.defineProperty(file, 'size', { value: 1024 });

        mockChooseFileFromFilePicker([ file ]);

        const input = spectator.query(byTestId('file-input')) as HTMLInputElement;
        expect(input.value).toBeFalsy();
    });

    const mockChooseFileFromFilePicker = (files: File[]) => {
        const input = spectator.query(byTestId('file-input')) as HTMLInputElement;

        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;

        input.dispatchEvent(new InputEvent('change'));
    };
});
