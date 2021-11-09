import { Observable } from 'rxjs';

import { DOCUMENT } from '@angular/common';
import {
    Inject,
    Injectable,
} from '@angular/core';
import { EventManager } from '@angular/platform-browser';

@Injectable()
export class ShortcutManager {
    private _activeShortcuts = new Map();

    constructor(
        @Inject(DOCUMENT) private _document: HTMLElement,
        private _eventManager: EventManager,
    ) { }

    addShortcut(
        shortcut: Shortcut,
        preventDefault: boolean = true,
        eventType: string = 'keydown',
    ) {
        this._activeShortcuts.set(shortcut.keys, shortcut.description);

        return new Observable(observer => {
            const detach = this._eventManager.addEventListener(
                this._document,
                `${eventType}.${shortcut.keys}`,
                (e: Event) => {
                    if (preventDefault) {
                        e.preventDefault();
                    }
                    observer.next(e);
                },
            );

            return () => {
                detach();
                this._activeShortcuts.delete(shortcut.keys);
            };
        });
    }
}

export interface Shortcut {
    keys: string;
    description: string;
}
