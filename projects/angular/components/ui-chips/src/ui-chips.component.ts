import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
} from '@angular/core';

@Component({
  selector: 'ui-ui-chips',
  templateUrl: './ui-chips.component.html',
  styleUrls: ['./ui-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiChipsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
