import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';

@Component({
  selector: 'ui-app-tree-select',
  templateUrl: './tree-select.page.html',
  styleUrls: ['./tree-select.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectPageComponent {
}

