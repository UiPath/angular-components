import { Component } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    EventGenerator,
    FakeFileList,
    IDropEvent,
} from '@uipath/angular/testing';

import * as faker from 'faker';

import { UiDragAndDropFileDirective } from './ui-drag-and-drop-file.directive';

@Component({
    template: `
    <div uiDragAndDropFile
        [fileType]="fileType"
        [fileClearRef]="clearRef"
        [disabled]="disabled"
        [multiple]="multiple"
        (fileClear)="onFileClear()"
        (fileChange)="onFileChange($event)">
        Test
    </div>
    <div #clearRef class="clear">
    </div>
    `,
})
class TestDragAndDropFileComponent {
    public fileType = '.txt';
    public disabled = false;
    public multiple = false;

    public files?: File[];

    onFileChange(files: FileList) {
        this.files = Array.from(files);
    }

    onFileClear() {
        this.files = undefined;
    }

    fakeFiles({ accepted = 0, rejected = 0 }): File[] {
        const randomArray = <T>(size: number, source: T[]) => new Array(size).fill(0).map(() => faker.random.arrayElement(source));
        const acceptedFileExtensions = this.fileType.split(', ');
        const rejectedFileEstensions = ['.jpg', '.png', '.tiff'];

        return faker.helpers
            .shuffle(
                [
                    ...randomArray(accepted, acceptedFileExtensions),
                    ...randomArray(rejected, rejectedFileEstensions),
                ],
            )
            .map(fakeFile);
    }

}

describe('Directive: UiDragAndDropFileDirective', () => {
    let component: TestDragAndDropFileComponent;
    let fixture: ComponentFixture<TestDragAndDropFileComponent>;
    let fileInput: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestDragAndDropFileComponent,
                UiDragAndDropFileDirective,
            ],
        });
        fixture = TestBed.createComponent(TestDragAndDropFileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        fileInput = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('input', () => {
        it('should be defined', () => {
            expect(fileInput).not.toBeNull();
        });

        it('should accept files of any type if file type is missing', () => {
            delete component.fileType;
            fixture.detectChanges();

            expect(fileInput.getAttribute('accept')).toBe('');
        });

        it('should accept files of the specified type if single file type', () => {
            expect(fileInput.getAttribute('accept')).toBe(component.fileType);
        });

        it('should accept files of any of the specified types if multiple file types', () => {
            const fileTypes = '.txt, .md';

            component.fileType = fileTypes;
            fixture.detectChanges();

            expect(fileInput.getAttribute('accept')).toBe(fileTypes);
        });


        it('should trigger browse when parent container is clicked', () => {
            const spy = spyOn(fileInput, 'click');

            const container = fixture.debugElement.query(By.css('div'));

            container.nativeElement.dispatchEvent(EventGenerator.click);

            expect(spy).toHaveBeenCalled();
        });

        it('should be hidden', () => {
            expect(fileInput.attributes.getNamedItem('hidden')).toBeTruthy();
        });
    });

    describe('file selection', () => {
        it('should remove value after clicking clear element', () => {
            component.files = component.fakeFiles({ accepted: 1 });

            const fileClear = fixture.debugElement.query(By.css('.clear')).nativeElement as HTMLDivElement;
            fileClear.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(component.files).toBeUndefined();
        });

        it('should NOT remove value after clicking clear element while disabled', () => {
            component.files = component.fakeFiles({ accepted: 1 });
            component.disabled = true;
            fixture.detectChanges();

            const fileClear = fixture.debugElement.query(By.css('.clear')).nativeElement as HTMLDivElement;
            fileClear.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(component.files).toBeTruthy();
        });

        describe('via drop', () => {
            let dropEvent: IDropEvent;
            let container: HTMLDivElement;

            beforeEach(() => {
                dropEvent = EventGenerator.drop();
                container = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
            });

            it('should emit files of any type if file type is missing', () => {
                delete component.fileType;
                fixture.detectChanges();

                dropEvent.dataTransfer.files.add(
                    fakeFile('.md'),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should emit files of the accepted type if single file type', () => {
                dropEvent.dataTransfer.files.add(
                    ...component.fakeFiles({ accepted: 1 }),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should emit files of the accepted types if multiple file types', () => {
                component.fileType = '.md, .html';
                fixture.detectChanges();

                dropEvent.dataTransfer.files.add(
                    ...component.fakeFiles({ accepted: 1 }),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should NOT emit files the accepted type if disabled', () => {
                component.disabled = true;
                fixture.detectChanges();

                dropEvent.dataTransfer.files.add(
                    ...component.fakeFiles({ accepted: 1 }),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeUndefined();
            });

            it('should NOT emit files of different types', () => {
                dropEvent.dataTransfer.files.add(
                    ...component.fakeFiles({ rejected: 1 }),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeUndefined();
            });

            it('should filter different file types', () => {
                component.multiple = true;
                fixture.detectChanges();

                dropEvent.dataTransfer.files.add(
                    ...component.fakeFiles({ accepted: 3, rejected: 5 }),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(3);
            });

            it('should NOT allow multiple files when multiple=false', () => {
                dropEvent.dataTransfer.files.add(
                    ...component.fakeFiles({ accepted: 2 }),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeUndefined();
            });
        });

        describe('via input', () => {
            let changeEvent: Event;
            let targetElement: {
                files: FakeFileList,
            };
            beforeEach(() => {
                changeEvent = EventGenerator.change();
                targetElement = changeEvent.target as any as {
                    files: FakeFileList,
                };
            });

            it('should emit files of any type if file type is missing', () => {
                delete component.fileType;
                fixture.detectChanges();

                targetElement.files.add(
                    fakeFile('.md'),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should emit files of the accepted type if single file type', () => {
                targetElement.files.add(
                    ...component.fakeFiles({ accepted: 1 }),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should emit files of the accepted types if multiple file types', () => {
                component.fileType = '.md, .html';
                fixture.detectChanges();

                targetElement.files.add(
                    ...component.fakeFiles({ accepted: 1 }),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });


            it('should NOT emit files of different types', () => {
                targetElement.files.add(
                    ...component.fakeFiles({ rejected: 1 }),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeUndefined();
            });

            it('should filter different file types', () => {
                component.multiple = true;
                fixture.detectChanges();

                targetElement.files.add(
                    ...component.fakeFiles({ accepted: 3, rejected: 5 }),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(3);
            });
        });
    });

    const appliedClass = 'file-dragging';
    describe(`${appliedClass} decoration`, () => {
        let container: HTMLDivElement;

        beforeEach(() => {
            container = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
        });

        it('should apply class on drag-over', () => {
            container.dispatchEvent(EventGenerator.dragOver);

            fixture.detectChanges();

            expect(container.classList.contains(appliedClass)).toBeTruthy();
        });

        it('should NOT apply class on drag-over if disabled', () => {
            component.disabled = true;
            fixture.detectChanges();

            container.dispatchEvent(EventGenerator.dragOver);

            fixture.detectChanges();

            expect(container.classList.contains(appliedClass)).toBeFalsy();
        });

        it('should remove class on drag-leave', () => {
            container.dispatchEvent(EventGenerator.dragOver);

            fixture.detectChanges();

            expect(container.classList.contains(appliedClass)).toBeTruthy();

            container.dispatchEvent(EventGenerator.dragLeave);
            fixture.detectChanges();

            expect(container.classList.contains(appliedClass)).toBeFalsy();
        });

        it('should remove class on drag-end', () => {
            container.dispatchEvent(EventGenerator.dragOver);

            fixture.detectChanges();

            expect(container.classList.contains(appliedClass)).toBeTruthy();

            container.dispatchEvent(EventGenerator.dragEnd);
            fixture.detectChanges();

            expect(container.classList.contains(appliedClass)).toBeFalsy();
        });
    });
});

function fakeFile(extension: string): File {
    return new File([''], `filename${extension}`, {
        lastModified: Date.now(),
    });
}
