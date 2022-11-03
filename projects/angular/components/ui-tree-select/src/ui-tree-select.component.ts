import {
 ChangeDetectionStrategy, Component, ViewEncapsulation,
} from '@angular/core';

@Component({
    selector: 'ui-tree-select',
    templateUrl: './ui-tree-select.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiTreeSelectComponent {
    title = 'hello';
}
