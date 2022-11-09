import { KeyboardShortcutDirective } from 'projects/angular/directives/keyboard-shortcut/src/keyboard-shortcut.directive';

import { Component } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

@Component({
    template: `
        <input
        uiKeyboardShortcut
        [shortcutKeys]="shortcuts"
        (shortcutPressed)="shortcutWasPressed=true"/>`,
})
class KeyboardShortcutTestFixtureComponent {
    shortcuts = [['Control', 'a'], ['X', 'Y', 'Z']]; shortcutWasPressed = false;
}

describe('Directive: KeyboardShortcut', () => {
    let fixture: ComponentFixture<KeyboardShortcutTestFixtureComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                KeyboardShortcutTestFixtureComponent,
                KeyboardShortcutDirective,
            ],
        });
        fixture = TestBed.createComponent(KeyboardShortcutTestFixtureComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should emit when one key combination was pressed', () => {
        document.dispatchEvent(EventGenerator.keyDown(Key.a));
        document.dispatchEvent(EventGenerator.keyDown(Key.Control));
        fixture.detectChanges();
        expect(fixture.componentInstance.shortcutWasPressed).toBeTrue();
    });

    it('should not emit if key combination is not simultaneously pressed', () => {
        document.dispatchEvent(EventGenerator.keyDown(Key.X));
        document.dispatchEvent(EventGenerator.keyDown(Key.a));
        document.dispatchEvent(EventGenerator.keyDown(Key.Y));
        document.dispatchEvent(EventGenerator.keyUp(Key.X));
        document.dispatchEvent(EventGenerator.keyDown(Key.Z));
        fixture.detectChanges();

        expect(fixture.componentInstance.shortcutWasPressed).toBeFalse();
    });
});
