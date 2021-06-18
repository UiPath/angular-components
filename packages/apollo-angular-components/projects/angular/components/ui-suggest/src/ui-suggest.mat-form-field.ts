import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import { Subject } from 'rxjs';

import {
    ChangeDetectorRef,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Optional,
    Output,
    Self,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    FormGroupDirective,
    NgControl,
    NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { identifier } from '@uipath/angular/utilities';

import {
    ISuggestValue,
    SuggestDirection,
    SuggestDisplayPriority,
} from './models';
import {
    checkAndNormalizeValue,
    sortByPriorityAndDirection,
} from './utils';

@Directive()
export abstract class UiSuggestMatFormFieldDirective implements
    DoCheck,
    MatFormFieldControl<ISuggestValue[]>,
    ControlValueAccessor {

    public abstract disabled: boolean;

    /**
     * Configure if the form control label should float.
     *
     */
    @HostBinding('class.floating')
    get shouldLabelFloat() {
        return this.focused || !this.empty;
    }

    /**
     * Configure if the input should be marked as `required` inside the form field.
     *
     */
    @Input()
    get required() {
        return this._required;
    }
    /**
     * @ignore
     */
    set required(required) {

        required = !!required || this._elementRef.nativeElement.hasAttribute('required');

        if (this._required !== required) {
            this._required = required;
            this.stateChanges.next();
        }
    }

    /**
     * Determine if the component is rendered inside a form control
     *
     */
    @HostBinding('class.form-control')
    get isFormControl() {
        return this._isFormControl || this._elementRef
            .nativeElement
            .classList
            .contains('form-control');
    }

    set isFormControl(value) {
        this._isFormControl = value;
    }

    /**
     * Configure the component placeholder.
     *
     */
    @Input()
    get placeholder() {
        return this._placeholder;
    }

    set placeholder(placeholder) {
        this._placeholder = placeholder;
        this.stateChanges.next();
    }

    /**
     * Set a custom size for the list items.
     *
     */
    @Input()
    customItemSize?: number;

    /**
     * Computes the component item height depending on the current render mode.
     *
     */
    get itemSize() {
        if (this.customItemSize) { return this.customItemSize; }

        return this.isFormControl ? 32 : 40;
    }

    /**
     * Returns `true` if there are no items available.
     *
     */
    get empty() {
        return !this._value.length;
    }

    /**
     * Determines if the render direction is `down`.
     *
     */
    get isDown() {
        return this._direction === 'down';
    }

    /**
     * Handles the dropdown value binding.
     *
     */
    @Input()
    get value() {
        return this._value;
    }
    /**
     * @ignore
     */
    set value(newValue: ISuggestValue[]) {

        const checkedNewValue = checkAndNormalizeValue(newValue);

        if (isEqual(checkedNewValue, this._value)) { return; }

        this._value = checkedNewValue;

        for (const entry of checkedNewValue) {
            this.selected.emit(entry);
        }
        this.stateChanges.next();
        this.registerChange(checkedNewValue);

        this._items = this._sortItems(this._items);
    }

    /**
     * @ignore
     */
    inputControl = new FormControl('');

    /**
     * Configure the component display priority.
     *
     */
    @Input()
    displayPriority: SuggestDisplayPriority = 'default';

    /**
     * @ignore
     */
    @HostBinding()
    id = `ui-suggest-${identifier()}`;

    /**
     * @ignore
     */
    describedBy?: string;

    /**
     * Emits the selected item value an item is selected.
     *
     */
    @Output()
    selected = new EventEmitter<ISuggestValue>();

    /**
     * Emits the deselected item value when an item is deselected.
     *
     */
    @Output()
    deselected = new EventEmitter<ISuggestValue>();

    /**
     * @ignore
     */
    errorState = false;
    /**
     * @ignore
     */
    focused = false;
    /**
     * @ignore
     */
    // eslint-disable-next-line rxjs/finnish
    stateChanges = new Subject<void>();

    protected _direction: SuggestDirection = 'down';
    protected _items: ISuggestValue[] = [];
    protected _value: ISuggestValue[] = [];

    private _isFormControl = false;

    private _placeholder = '';
    private _required = false;

    /**
     * @ignore
     */
    constructor(
        protected _elementRef: ElementRef,
        private _errorStateMatcher: ErrorStateMatcher,
        private _parentForm: NgForm,
        private _parentFormGroup: FormGroupDirective,
        protected _cd: ChangeDetectorRef,
        @Optional()
        @Self()
        public ngControl: NgControl,
    ) {
        this.isFormControl = this.isFormControl || !!this.ngControl;

        // prevent cyclic dependency
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    /**
     * @ignore
     */
    ngDoCheck() {
        if (!this.ngControl) { return; }

        const oldState = this.errorState;
        const control = this.ngControl ?
            this.ngControl.control as FormControl :
            null;
        const parent = this._parentFormGroup || this._parentForm;
        const newState = this._errorStateMatcher.isErrorState(control, parent);

        if (newState !== oldState) {
            this.errorState = newState;
            this.stateChanges.next();
        }
    }

    /**
     * @ignore
     */
    public abstract onContainerClick(event: MouseEvent): void;

    /**
     * Clears the search input value.
     */
    clear() {
        this.inputControl.setValue('');
    }

    /**
     * @ignore
     */
    setDescribedByIds(ids: string[]) {
        this.describedBy = ids.join(' ').trim() || undefined;
    }

    /**
     * @ignore
     */
    writeValue(value: ISuggestValue[]) {
        value = checkAndNormalizeValue(value);

        if (!isEqual(value, this._value)) {
            this._value = value;
            this._cd.markForCheck();
        }
    }

    /**
     * @ignore
     */
    registerChange = (_: ISuggestValue[]) => { };

    /**
     * @ignore
     */
    registerTouch: (ev?: Event) => void = (_?: Event) => { };

    /**
     * @ignore
     */
    registerOnChange(fn: (_: ISuggestValue[]) => any) {
        this.registerChange = fn;
    }

    /**
     * @ignore
     */
    registerOnTouched(fn: (ev?: Event) => void) {
        this.registerTouch = fn;
    }

    protected _sortItems = (items: ISuggestValue[]) =>
        sortByPriorityAndDirection(
            cloneDeep(items),
            this.displayPriority,
            this.value,
            this.isDown,
        );

}
