import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';

@Component({
  selector: 'ui-chips-page',
  templateUrl: './chips.page.html',
  styleUrls: ['./chips.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsPageComponent {

  constructor() { }

}
