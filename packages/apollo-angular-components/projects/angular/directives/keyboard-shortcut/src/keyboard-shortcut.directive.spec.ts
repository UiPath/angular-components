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
        (shortcutPressed)="shortcutEmissionCounter=shortcutEmissionCounter+1"/>`,
})
class KeyboardShortcutTestFixtureComponent {
    shortcuts = [['Control', 'a'], ['X', 'Y', 'Z']]; shortcutEmissionCounter = 0;
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
        expect(fixture.componentInstance.shortcutEmissionCounter).toBeTruthy();
    });

    it('should not emit second time until all keys are released and pressed again', () => {
        document.dispatchEvent(EventGenerator.keyDown(Key.a));
        document.dispatchEvent(EventGenerator.keyDown(Key.Control));
        fixture.detectChanges();
        expect(fixture.componentInstance.shortcutEmissionCounter).toEqual(1);
        document.dispatchEvent(EventGenerator.keyUp(Key.a));
        document.dispatchEvent(EventGenerator.keyDown(Key.a));
        fixture.detectChanges();
        expect(fixture.componentInstance.shortcutEmissionCounter).toEqual(1);
        document.dispatchEvent(EventGenerator.keyUp(Key.Control));
        document.dispatchEvent(EventGenerator.keyDown(Key.Control));
        expect(fixture.componentInstance.shortcutEmissionCounter).toEqual(2);
    });

    it('should not emit if key combination is not simultaneously pressed', () => {
        document.dispatchEvent(EventGenerator.keyDown(Key.X));
        document.dispatchEvent(EventGenerator.keyDown(Key.a));
        document.dispatchEvent(EventGenerator.keyDown(Key.Y));
        document.dispatchEvent(EventGenerator.keyUp(Key.X));
        document.dispatchEvent(EventGenerator.keyDown(Key.Z));
        fixture.detectChanges();

        expect(fixture.componentInstance.shortcutEmissionCounter).toBeFalsy();
    });
});
