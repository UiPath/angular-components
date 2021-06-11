import { Component } from '@angular/core';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
    selector: 'ui-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public isSidenavOpen = true;

    public componentLinks = [
        {
            name: 'Home',
            link: '/home',
        },
        {
            name: 'Grid',
            link: '/grid',
        },
        {
            name: 'Snackbar',
            link: '/snackbar',
        },
    ];
}
