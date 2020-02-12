import { IDropEvent } from './events';
import { FakeFileList } from './fake-file-list';
import { CURSOR_IMG } from './internal';
import {
    IKey,
    IKeyModifier,
    Key,
} from './key';

type KeyOrKeyName = (IKey | keyof Key);

/**
 * Most `unit tests` require user interaction, this collection aims to simplify event dispatching,
 * by providing a collection of methods and properties that create the most often required `UIEvents`.
 *
 * @export
 * @dynamic
 */
export class EventGenerator {
    /**
     * A cursor utility that draws a cursor icon over the tested component.
     *
     * Very useful when testing hover effects.
     *
     */
    public static cursor = {
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
            EventGenerator.cursor.ref.style.background = CURSOR_IMG;

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

    /**
     * Gets a `click` event.
     *
     */
    static get click(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('click', true, true);
        return event;
    }

    /**
     * Gets a `mouseenter` event.
     *
     */
    static get mouseEnter(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('mouseenter', true, true);
        return event;
    }

    /**
     * Gets a `mouseleave` event.
     *
     */
    static get mouseLeave(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('mouseleave', true, true);
        return event;
    }

    /**
     * Gets a `dblclick` event.
     *
     */
    static get doubleClick(): MouseEvent {
        const event = document.createEvent('MouseEvent');
        event.initEvent('dblclick', true, true);
        return event;
    }

    /**
     * Gets a `dragover` event.
     *
     */
    static get dragOver() {
        const dragOverEvent = new Event('DragEvent');
        dragOverEvent.initEvent('dragover', true, true);
        return dragOverEvent;
    }

    /**
     * Gets a `dragleave` event.
     *
     */
    static get dragLeave() {
        const dragOverEvent = new Event('DragEvent');
        dragOverEvent.initEvent('dragleave', true, true);
        return dragOverEvent;
    }

    /**
     * Gets a `dragEnd` event.
     *
     */
    static get dragEnd() {
        const dragOverEvent = new Event('DragEvent');
        dragOverEvent.initEvent('dragend', true, true);
        return dragOverEvent;
    }

    /**
     * KeyDown event generator helper.
     *
     * @param key The pressed key.
     * @param [modifier] The active modifier, if any.
     * @returns A `keydown` event with the provided key and modifier metadata.
     */
    static keyDown(key: KeyOrKeyName, modifier?: IKeyModifier): KeyboardEvent {
        return EventGenerator._key('keydown', key, modifier);
    }

    /**
     * KeyUp event generator helper.
     *
     * @param key The pressed key.
     * @param [modifier] The active modifier, if any.
     * @returns A `keyup` event with the provided key and modifier metadata.
     */
    static keyUp(key: KeyOrKeyName, modifier?: IKeyModifier): KeyboardEvent {
        return EventGenerator._key('keyup', key, modifier);
    }

    /**
     *  Drop event generator, helpful for testing `HTMLInputElement`s of type `file`.
     *
     * @param [files=[]] A list of files to associated to the event.
     * @returns The drop event with the `dataTransfer` and `files` properties populated.
     */
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

    /**
     * Change event generator helpful for testing `HTMLInputElement`s.
     *
     * @returns A simple `change` event.
     */
    static change(): Event {
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

    /**
     * Generates an input event helpful for testing `HTMLInputElement`s.
     *
     * @returns A simple `input` event.
     */
    static input(): Event {
        const event = document.createEvent('Event');
        event.initEvent('input', true, true);
        return event;
    }

    /**
     * Generates a `click` event on the requested X, Y coordinates.
     *
     * @param offsetX The X offset value.
     * @param offsetY The Y offset value.
     * @returns A `click` event with the `offsetX` and `offsetY` properties populated.
     */
    static clickXY(offsetX: number, offsetY: number): MouseEvent {
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

    /**
     * Generates a `mousemove` event on the requested X, Y coordinates.
     *
     * @param offsetX The X offset value.
     * @param offsetY The Y offset value.
     * @returns A `mousemove` event with the `offsetX` and `offsetY` properties populated.
     */
    static moveXY(offsetX: number, offsetY: number): MouseEvent {
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

    private static _key(type: string, key: IKey | keyof Key, modifier = {} as IKeyModifier) {
        const safeKey = EventGenerator._getKey(key) as IKey;
        const options: KeyboardEventInit & { keyCode: number } = {
            code: `${safeKey.code}`,
            key: safeKey.name,
            keyCode: safeKey.keyCode,
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
