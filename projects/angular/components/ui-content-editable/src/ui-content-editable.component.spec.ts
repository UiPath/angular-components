import {
    Component,
    DebugElement,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import {
    FormControl,
    ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EventGenerator } from '@uipath/angular/testing';

import { UiContentEditableComponent } from './ui-content-editable.component';
import { UiContentEditableModule } from './ui-content-editable.module';

const getSelectors = (debugElement: DebugElement) => ({
    view: debugElement.query(By.css('[data-cy=content-editable-view]')),
    input: debugElement.query(By.css('[data-cy=content-editable-input]')),
    editButton: debugElement.query(By.css('[data-cy=content-editable-edit-button]')),
    container: debugElement.query(By.css('[data-cy=editable-container]')),
    icon: debugElement.query(By.css('[data-cy=content-icon]')),
});

@Component({
    template: `
        <ui-content-editable [readonly]="readonly"
                             [formControl]="editableFormControl"
                             [errorMessage]="errorMessage"
                             (save)="onSave()"
                             (reset)="onReset()">
        </ui-content-editable>
    `,
})
class ContentEditableComponent {
    @ViewChild(UiContentEditableComponent, {
        static: true,
    })
    public uiContentEditable!: UiContentEditableComponent;

    public editableFormControl = new FormControl('Folder');
    public errorMessage: null | string = null;
    public readonly = false;

    public onSave = () => { };
    public onReset = () => { };
}

describe('Component: UiContentEditable', () => {
    let fixture: ComponentFixture<ContentEditableComponent>;
    let component: ContentEditableComponent;
    let selectors: {
        [name: string]: DebugElement,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                NoopAnimationsModule,
                UiContentEditableModule,
            ],
            declarations: [
                ContentEditableComponent,
            ],
        });

        fixture = TestBed.createComponent(ContentEditableComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();

        selectors = getSelectors(fixture.debugElement);
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should be created', () => {
        expect(component.uiContentEditable).toBeDefined();
    });

    describe('when readonly is true', () => {
        beforeEach(() => {
            component.readonly = true;

            fixture.detectChanges();

            selectors = getSelectors(fixture.debugElement);
        });

        it('should not have edit button', () => {
            expect(selectors.editButton?.nativeElement).toBeFalsy();
        });

        it('should not have input', () => {
            expect(selectors.input?.nativeElement).toBeFalsy();
        });
    });

    describe('when readonly is false', () => {
        it('should display edit button', () => {
            expect(selectors.editButton?.nativeElement).toBeTruthy();
        });

        it('should not have input', () => {
            expect(selectors.input?.nativeElement).toBeFalsy();
        });

        it('should have accent edit icon', () => {
            const icon = selectors.icon?.nativeElement;

            expect(icon?.innerText).toBe('edit');
            expect(icon?.getAttribute('ng-reflect-color')).toBe('accent');
        });

        describe('when in edit mode', () => {
            beforeEach(() => {
                selectors.editButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                selectors = getSelectors(fixture.debugElement);
            });

            it('should show input', () => {
                expect(selectors.input?.nativeElement).toBeTruthy();
            });

            it('should have isEditMode set to true', () => {
                expect(component.uiContentEditable.isEditMode).toBeTruthy();
            });

            it('should have accent check icon', () => {
                const icon = selectors.icon?.nativeElement;

                expect(icon?.innerText).toBe('check');
                expect(icon?.getAttribute('ng-reflect-color')).toBe('accent');
            });

            it('should add .hide-content class to the view div', () => {
                expect(selectors.view?.nativeElement?.classList).toContain('hide-content');
            });

            it('should call onReset function when focused out', fakeAsync(() => {
                spyOn(component, 'onReset');

                selectors.container.triggerEventHandler('focusout', {});

                tick();

                expect(component.onReset).toHaveBeenCalled();
            }));

            it('should call onSave function when save button pressed', () => {
                spyOn(component, 'onSave');
                selectors.editButton.nativeElement.dispatchEvent(EventGenerator.click);
                fixture.detectChanges();

                expect(component.onSave).toHaveBeenCalled();
            });

            it('should update input value when the model value changes', fakeAsync(() => {
                const newValue = 'Folder New';
                component.editableFormControl.setValue(newValue);

                fixture.detectChanges();
                tick();

                expect(component.uiContentEditable.value).toBe(newValue);
                expect((selectors.input?.nativeElement as HTMLInputElement).value).toBe(newValue);
            }));

            it('should have warn close icon if it has error message', () => {
                component.errorMessage = 'error';
                const icon = selectors.icon?.nativeElement;

                fixture.detectChanges();

                expect(icon?.innerText).toBe('close');
                expect(icon?.getAttribute('ng-reflect-color')).toBe('warn');
            });
        });

        it('should be in edit mode after view is clicked', () => {
            selectors.view.nativeElement.dispatchEvent(EventGenerator.click);

            expect(component.uiContentEditable.isEditMode).toBeTruthy();
        });
    });
});
