import {
    firstValueFrom,
    of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class QueuedAnnouncer {
    private _msgQueue: string[] = [];
    private _isAnnouncing = false;

    constructor(private _liveAnnouncer: LiveAnnouncer) { }

    enqueue(msg: string) {
        this._msgQueue.push(msg);

        if (!this._isAnnouncing) {
            this._isAnnouncing = true;
            this._announceNext();
        }
    }

    private _announceNext = () => {
        if (!this._msgQueue.length) {
            this._isAnnouncing = false;
            return;
        }

        this._liveAnnouncer.announce(this._msgQueue.shift()!)
            // announcements end up in an aria-live element
            // a delay is needed before setting the next announcement so they are both picked up by the screen reader
            .then(() => firstValueFrom(of(void 0).pipe(delay(50))))
            .then(this._announceNext)
            .catch(this._announceNext);
    };
}
