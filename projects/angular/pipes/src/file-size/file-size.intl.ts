import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiFileSizeIntl {
    bytes$ = (size: string) => of(`${size} B`);
    kiloBytes$ = (size: string) => of(`${size} KB`);
    megaBytes$ = (size: string) => of(`${size} MB`);
    gigaBytes$ = (size: string) => of(`${size} GB`);
}
