import {
    Shortcut,
    ShortcutManager,
} from 'projects/angular/services/shortcut-manager/shortcut-manager.service';
import { Subscription } from 'rxjs';

import { Component } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Shortcut Manager', () => {
    @Component({
        template: `
            <h1 class="target"> testing the shortcut manager </h1>
        `,
    })
    class TestFixtureComponent {
        subscription$?: Subscription;

        constructor(private _shortcutManager: ShortcutManager) {
        }

        setShortcut(s: Shortcut, cb: any) {
            this.subscription$ = this._shortcutManager.addShortcut(s).subscribe(cb);
        }

        removeShortcut() {
            this.subscription$?.unsubscribe();
        }
    }

    let fixture: ComponentFixture<TestFixtureComponent>;
    let component: TestFixtureComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
            ],
            declarations: [TestFixtureComponent],
        });

        fixture = TestBed.createComponent(TestFixtureComponent);

        fixture.detectChanges();

        component = fixture.componentInstance;
    });

    it('should be defined', () => {
        expect(component).toBeTruthy();
    });
});
