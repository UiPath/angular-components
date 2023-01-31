import {
    Directive,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';

/**
 * Directive that listens for specified key combination
 * then emits an event
 *
 * @input: an array of key combinations, where a key combination is an array of strings
 */

@Directive({
    selector: '[uiKeyboardShortcut][shortcutKeys]',
})
export class KeyboardShortcutDirective {
    @Input()
    shortcutKeys!: string[][];

    @Output()
    shortcutPressed = new EventEmitter<void>();

    private _pressedKeys: Record<string, boolean> = {};

    @HostListener('document:keydown', ['$event'])
    searchShortcutKeydownHandler(event: KeyboardEvent) {
        if (!this._keyInShortcut(event)) { return; }

        this._pressedKeys[event.key] = true;
        if (this.shortcutKeys.find(keyCombination => keyCombination.every(key => this._pressedKeys[key]))) {
            this.shortcutPressed.emit();
            this._pressedKeys = {};
        }
    }

    @HostListener('document:keyup', ['$event'])
    searchShortcutKeyupHandler(event: KeyboardEvent) {
        if (!this._keyInShortcut(event)) { return; }
        this._pressedKeys[event.key] = false;
    }

    private _keyInShortcut({ key }: KeyboardEvent) {
        return this.shortcutKeys.find(keyCombination => !!keyCombination.find(k => k === key));
    }
}
