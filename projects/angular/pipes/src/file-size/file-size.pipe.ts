import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import { Observable } from 'rxjs';
import { UiFileSizeIntl } from './file-size.intl';

@Pipe({ name: 'uiFileSize' })
export class UiFileSizePipe implements PipeTransform {
    FileSizeUnits = [
        {
            key: this._intl.bytes$,
            divider: 1,
        },
        {
            key: this._intl.kiloBytes$,
            divider: 1024,
        },
        {
            key: this._intl.megaBytes$,
            divider: 1024 * 1024,
        },
        {
            key: this._intl.gigaBytes$,
            divider: 1024 * 1024 * 1024,
        },
    ];

    constructor(
        private readonly _intl: UiFileSizeIntl,
    ) {}

    transform(value: number | null | undefined): Observable<string> {
        if (!value) {
            return this.FileSizeUnits[0].key('0');
        }
        // default to highest unit if no unit matches the range from 1 to 1024
        const correctUnit = this.FileSizeUnits.find(
            (unit) => value / unit.divider >= 1 && value / unit.divider < 1024,
        ) ?? this.FileSizeUnits[this.FileSizeUnits.length - 1];

        const computedValue = Math.round(value / correctUnit.divider * 10) / 10;
        return correctUnit.key(computedValue.toLocaleString());
    }

}
