import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';

@Component({
    selector: 'ui-autocomplete',
    template: './ui-autocomplete.component.html',
    styleUrls: ['./ui-autocomplete.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAutocompleteComponent {

}
