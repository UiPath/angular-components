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
    public files?: File[];
    public disabled = false;
    public multiple = false;

    onFileChange(files: FileList) {
        this.files = Array.from(files);
    }

    onFileClear() {
        this.files = undefined;
    }
}

const fakeFile = (extension: string) =>
    new File([''], `filename${extension}`, {
        lastModified: Date.now(),
    });

const appliedClass = 'file-dragging';

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

        it('should have the correct accept type', () => {
            expect(fileInput.getAttribute('accept')).toBe(component.fileType);
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
            component.files = [fakeFile(component.fileType)];

            const fileClear = fixture.debugElement.query(By.css('.clear')).nativeElement as HTMLDivElement;
            fileClear.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();

            expect(component.files).toBeUndefined();
        });
        it('should not remove value after clicking clear element while disabled', () => {
            component.files = [fakeFile(component.fileType)];
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

            it('should emit files the accepted type', () => {
                dropEvent.dataTransfer.files.add(
                    fakeFile(component.fileType),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should not emit files the accepted type if disabled', () => {
                component.disabled = true;
                fixture.detectChanges();

                dropEvent.dataTransfer.files.add(
                    fakeFile(component.fileType),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeUndefined();
            });

            it('should NOT emit files of different types', () => {
                dropEvent.dataTransfer.files.add(
                    fakeFile('.jpg'),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeUndefined();
            });

            it('should filter different file types', () => {
                component.multiple = true;
                fixture.detectChanges();

                dropEvent.dataTransfer.files.add(
                    fakeFile(component.fileType),
                    fakeFile(component.fileType),
                    fakeFile('.jpg'),
                    fakeFile('.png'),
                    fakeFile(component.fileType),
                    fakeFile('.tiff'),
                );

                container.dispatchEvent(dropEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(3);
            });

            it('should NOT allow multiple files when multiple=false', () => {
                dropEvent.dataTransfer.files.add(
                    fakeFile('.jpg'),
                    fakeFile('.png'),
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

            it('should emit files the accepted type', () => {
                targetElement.files.add(
                    fakeFile(component.fileType),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(1);
            });

            it('should NOT emit files of different types', () => {
                targetElement.files.add(
                    fakeFile('.jpg'),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeUndefined();
            });

            it('should filter different file types', () => {
                component.multiple = true;
                fixture.detectChanges();

                targetElement.files.add(
                    fakeFile(component.fileType),
                    fakeFile(component.fileType),
                    fakeFile('.jpg'),
                    fakeFile('.png'),
                    fakeFile(component.fileType),
                    fakeFile('.tiff'),
                );

                fileInput.dispatchEvent(changeEvent);

                expect(component.files).toBeDefined();
                expect(component.files!.length).toBe(3);
            });
        });
    });

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
        it('should not apply class on drag-over if disabled', () => {
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
