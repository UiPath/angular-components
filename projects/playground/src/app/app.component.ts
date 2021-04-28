import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
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
