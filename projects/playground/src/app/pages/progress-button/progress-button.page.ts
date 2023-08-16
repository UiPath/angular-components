import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

@Component({
  selector: 'ui-app-progress-button',
  templateUrl: './progress-button.page.html',
  styleUrls: ['./progress-button.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressButtonPageComponent {
  isLoading = false;

  toggle() {
    this.isLoading = !this.isLoading;
  }
}
