import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { Subject } from 'rxjs';

@Component({
    selector: 'ui-content-editable',
    templateUrl: './ui-content-editable.component.html',
    styleUrls: ['./ui-content-editable.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: UiContentEditableComponent,
        multi: true,
    }],
})
export class UiContentEditableComponent implements ControlValueAccessor, OnDestroy {
    @HostBinding('class')
    public hostClass = 'ui-content-editable';

    public set value(value: string) {
        this._value = value;
        this.onChange(this.value);
        this.stateChanges.next();
    }

    public get value() {
        return this._value;
    }

    @Input()
    public readonly = true;

    @Input()
    public saveLabel = 'save';

    @Input()
    public cancelLabel = 'cancel';

    @Input()
    public errorMessage?: string;

    @Input()
    public isSingleLine = true;

    @Output()
    public save = new EventEmitter<void>();

    @Output()
    public reset = new EventEmitter<void>();

    public isHovered = false;
    public isEditMode = false;
    public stateChanges = new Subject<void>();

    private _value!: string;

    constructor(
        private _cd: ChangeDetectorRef,
        private _hostElement: ElementRef,
    ) { }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    public onChange = (_: string) => { };
    public onTouch: (ev: Event) => void = (_: Event) => { };

    public handleEnterKey(event: Event) {
        event.preventDefault();
        this._submitValue();
    }

    public handleIconClick() {
        if (!this.isEditMode) {
            this.isEditMode = true;
        } else {
            this._submitValue();
        }
    }

    public handleContainerFocusOut() {
        if (!this.isEditMode) { return; }

        setTimeout(() => {
            if (this._hostElement.nativeElement.contains(document.activeElement)) {
                return;
            }

            this.isEditMode = false;
            this.reset.emit();
        }, 0);
    }

    writeValue(value: string) {
        this._value = value;
        this._cd.markForCheck();
    }

    registerOnChange(fn: (_: string) => {}) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (ev: Event) => void) {
        this.onTouch = fn;
    }

    private _submitValue() {
        if (this.isEditMode) {
            this.isEditMode = false;
        }
        this.save.emit();
    }
}
