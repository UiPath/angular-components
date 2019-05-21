import { IDropEvent } from './event-generator';
import { FakeFileList } from './fake-file-list';
import {
  IKey,
  IKeyModifier,
  Key,
} from './key';

export interface IDropEvent extends Event {
    dataTransfer: {
        files: FakeFileList,
    };
}

// @dynamic
export class EventGenerator {
    static cursor = {
        ref: {} as HTMLElement,
        initialize: (parent?: HTMLElement) => {
            if (!parent) { return; }
            EventGenerator.cursor.ref = document.createElement('div') as HTMLElement;

            EventGenerator.cursor.ref.style.position = 'absolute';
            EventGenerator.cursor.ref.style.display = 'block';
            EventGenerator.cursor.ref.style.left = '0px';
            EventGenerator.cursor.ref.style.top = '0px';
            EventGenerator.cursor.ref.style.width = '20px';
            EventGenerator.cursor.ref.style.height = '20px';
            // tslint:disable-next-line:max-line-length
            EventGenerator.cursor.ref.style.background = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABLFBMVEUAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQECAgIKCgoNDQ0ODg4PDw8TExMVFRUeHh4hISEoKCgvLy89PT1QUFBWVlZaWlpiYmJoaGh3d3d5eXl9fX2IiIiXl5eZmZmmpqaoqKiqqqqrq6usrKywsLC1tbW4uLi8vLzBwcHU1NTc3Nzf39/o6Ojp6ens7Ozw8PD39/f4+Pj5+fn6+vr7+/v8/Pz9/f3///8jvPNLAAAAMnRSTlMAAAEGBxETFRodKDE/Q0ldXmZqeX1/hYeLjZaYmZqbnJ2ep6y0ur3JzNbi4+To7O38/mEAm4cAAADUSURBVHgBXdDlUoZAFMbxxcBu7MAQW8EHsbtDVOxgFX3u/x7EAfeFPTPny2/OhzN/YRhG0yQ6hZoU/nbQ34al4xgez9Cv4SgiHsMuo40b8hQTGt7yh+dw9Ms44QWmCziCkDLVK8zWlFHGX4wwV/uPwxl+kk+BW1/AOJGSZISpAn6Td5s7a1vBeI5DuGZy+PGOxS6rrVrhPfdwyRPPVC+lGB64C7t8xUAF+/xVNLbigUfLpsK67vkWUbW0zzf0KMxC9OLled3RsAEbK16zhqJ9piMP8gvd2SzacwFNVgAAAABJRU5ErkJggg==)';

            parent.appendChild(EventGenerator.cursor.ref);
        },
        destroy: (parent?: HTMLElement) => {
            if (!parent) { return; }

            parent.removeChild(EventGenerator.cursor.ref);
        },
        update: (x: number, y: number) => {
            EventGenerator.cursor.ref.style.left = `${x - 10}px`;
            EventGenerator.cursor.ref.style.top = `${y - 10}px`;
        },
    };

    static get click(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('click', true, true);
        return event;
    }

    static get mouseEnter(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('mouseenter', true, true);
        return event;
    }

    static get mouseLeave(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('mouseleave', true, true);
        return event;
    }

    static get doubleClick(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('dblclick', true, true);
        return event;
    }

    static keyDown(key: IKey | keyof Key, modifier?: IKeyModifier): KeyboardEvent {
        return EventGenerator._key('keydown', key, modifier);
    }

    static keyUp(key: IKey | keyof Key, modifier?: IKeyModifier): KeyboardEvent {
        return EventGenerator._key('keyup', key, modifier);
    }

    static drop(files: File[] = []): IDropEvent {
        const fileList = new FakeFileList(files);

        const ev = new DragEvent('drop');

        Object.defineProperty(ev, 'dataTransfer', {
            value: new DataTransfer(),
        });
        Object.defineProperty(ev.dataTransfer, 'files', {
            value: fileList,
        });


        return ev as any as IDropEvent;
    }

    static change() {
        const fileList = new FakeFileList();
        const changeEvent = new Event('InputEvent');

        changeEvent.initEvent('change', true, true);

        Object.defineProperty(changeEvent, 'target', {
            value: changeEvent.target || {},
        });

        Object.defineProperty(changeEvent.target, 'files', {
            value: fileList,
        });

        return changeEvent;
    }

    static input() {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        return event;
    }

    static clickXY(offsetX: number, offsetY: number) {
        const event = this.click;

        Object.defineProperty(event, 'offsetX', {
            value: offsetX,
        });
        Object.defineProperty(event, 'offsetY', {
            value: offsetY,
        });

        this.cursor.update(offsetX, offsetY);
        return event;
    }

    static moveXY(offsetX: number, offsetY: number) {
        const event = document.createEvent('MouseEvent');
        event.initEvent('mousemove', true, false);


        Object.defineProperty(event, 'offsetX', {
            value: offsetX,
        });
        Object.defineProperty(event, 'offsetY', {
            value: offsetY,
        });

        this.cursor.update(offsetX, offsetY);
        return event;
    }

    static get dragOver() {
        const dragOverEvent = new Event('DragEvent');
        dragOverEvent.initEvent('dragover', true, true);
        return dragOverEvent;
    }

    static get dragLeave() {
        const dragOverEvent = new Event('DragEvent');
        dragOverEvent.initEvent('dragleave', true, true);
        return dragOverEvent;
    }

    static get dragEnd() {
        const dragOverEvent = new Event('DragEvent');
        dragOverEvent.initEvent('dragend', true, true);
        return dragOverEvent;
    }

    private static _key(type: string, key: IKey | keyof Key, modifier = {} as IKeyModifier) {
        const safeKey = EventGenerator._getKey(key) as IKey;
        const options: KeyboardEventInit = {
            code: `${safeKey.code}`,
            key: safeKey.name,
            shiftKey: modifier === Key.Shift,
            altKey: modifier === Key.Alt,
            ctrlKey: modifier === Key.Control,
        };
        return new KeyboardEvent(type, options);
    }

    private static _getKey(key: IKey | keyof Key): IKey {
        if (typeof key === 'string') {
            const internalKey: IKey = Key[key];
            if (!internalKey) {
                throw new Error(`Key definition for ${key} does not exist!`);
            }
            return internalKey;
        }

        return key as IKey;
    }
}
