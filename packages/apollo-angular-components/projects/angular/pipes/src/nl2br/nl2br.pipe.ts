import {
    Pipe,
    PipeTransform,
} from '@angular/core';

@Pipe({ name: 'nl2br' })
export class UiNl2BrPipe implements PipeTransform {
    transform(value?: string | null) {
        return value ?
            value
                .replace(/\r\n/g, '<br/>')
                .replace(/\r/g, '<br/>')
                .replace(/\n/g, '<br/>')
            :
            null;
    }
}
