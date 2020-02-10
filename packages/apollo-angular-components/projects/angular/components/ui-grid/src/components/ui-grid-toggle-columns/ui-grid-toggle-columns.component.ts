import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    MatSelect,
    MatSelectChange,
} from '@angular/material/select';

import isEqual from 'lodash-es/isEqual';

import {
    IGridDataEntry,
    IVisibleModel,
} from '../../models';

const COMPONENT_SELECTOR = 'ui-grid-toggle-columns';

@Component({
    selector: COMPONENT_SELECTOR,
    templateUrl: './ui-grid-toggle-columns.component.html',
    styleUrls: ['./ui-grid-toggle-columns.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGridToggleColumnsComponent<T extends IGridDataEntry>  {
    @HostBinding('class')
    public hostClass = COMPONENT_SELECTOR;

    @HostBinding(`class.${COMPONENT_SELECTOR}-dirty`)
    @Input()
    public dirty = false;

    @Input()
    public set options(options: IVisibleModel<T>[] | null) {
        if (!options || isEqual(this._options, options)) { return; }

        this._options = options;
        this._selected = options
            .filter(({ checked }) => checked)
            .map(o => o.property);
    }
    public get options() {
        return this._options;
    }

    @Input()
    public toggleTooltip?: string;

    @Input()
    public toggleTitle?: string;

    @Input()
    public resetToDefaults?: string;

    @Input()
    public togglePlaceholderTitle?: string;

    @Output()
    public visibleColumns = new EventEmitter<IVisibleModel<T>>();

    @Output()
    public resetColumns = new EventEmitter<void>();

    @ViewChild(MatSelect, { static: false })
    public selectColumns?: MatSelect;

    public get selected() {
        return this._selected;
    }

    private _selected: Array<string | keyof T> = [];
    private _options: IVisibleModel<T>[] = [];

    public selectionChange({ value }: MatSelectChange) {
        this._selected = value;
        this._options
            .forEach(c => c.checked = value.includes(c.property));

        this.visibleColumns.emit(value);
    }

    public reset() {
        this.resetColumns.emit();
        this.selectColumns!.close();
    }
}
