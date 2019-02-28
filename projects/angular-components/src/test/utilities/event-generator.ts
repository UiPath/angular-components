import { IDropEvent } from './event-generator';

export interface IKey {
    code: number;
    name: string;
}

export interface IKeyModifier extends IKey {
    code: number;
    name: 'Shift' | 'Control' | 'Alt';
}

export class Key {
    public static q: IKey = {
        name: 'q',
        code: 81,
    };
    public static w: IKey = {
        name: 'w',
        code: 87,
    };
    public static e: IKey = {
        name: 'e',
        code: 69,
    };
    public static r: IKey = {
        name: 'r',
        code: 82,
    };
    public static t: IKey = {
        name: 't',
        code: 84,
    };
    public static y: IKey = {
        name: 'y',
        code: 89,
    };
    public static u: IKey = {
        name: 'u',
        code: 85,
    };
    public static i: IKey = {
        name: 'i',
        code: 73,
    };
    public static o: IKey = {
        name: 'o',
        code: 79,
    };
    public static p: IKey = {
        name: 'p',
        code: 80,
    };
    public static a: IKey = {
        name: 'a',
        code: 65,
    };
    public static s: IKey = {
        name: 's',
        code: 83,
    };
    public static d: IKey = {
        name: 'd',
        code: 68,
    };
    public static f: IKey = {
        name: 'f',
        code: 70,
    };
    public static g: IKey = {
        name: 'g',
        code: 71,
    };
    public static h: IKey = {
        name: 'h',
        code: 72,
    };
    public static j: IKey = {
        name: 'j',
        code: 74,
    };
    public static k: IKey = {
        name: 'k',
        code: 75,
    };
    public static l: IKey = {
        name: 'l',
        code: 76,
    };
    public static z: IKey = {
        name: 'z',
        code: 90,
    };
    public static x: IKey = {
        name: 'x',
        code: 88,
    };
    public static c: IKey = {
        name: 'c',
        code: 67,
    };
    public static v: IKey = {
        name: 'v',
        code: 86,
    };
    public static b: IKey = {
        name: 'b',
        code: 66,
    };
    public static n: IKey = {
        name: 'n',
        code: 78,
    };
    public static m: IKey = {
        name: 'm',
        code: 77,
    };
    public static Q: IKey = {
        name: 'Q',
        code: 81,
    };
    public static W: IKey = {
        name: 'W',
        code: 87,
    };
    public static E: IKey = {
        name: 'E',
        code: 69,
    };
    public static R: IKey = {
        name: 'R',
        code: 82,
    };
    public static T: IKey = {
        name: 'T',
        code: 84,
    };
    public static Y: IKey = {
        name: 'Y',
        code: 89,
    };
    public static U: IKey = {
        name: 'U',
        code: 85,
    };
    public static I: IKey = {
        name: 'I',
        code: 73,
    };
    public static O: IKey = {
        name: 'O',
        code: 79,
    };
    public static P: IKey = {
        name: 'P',
        code: 80,
    };
    public static A: IKey = {
        name: 'A',
        code: 65,
    };
    public static S: IKey = {
        name: 'S',
        code: 83,
    };
    public static D: IKey = {
        name: 'D',
        code: 68,
    };
    public static F: IKey = {
        name: 'F',
        code: 70,
    };
    public static G: IKey = {
        name: 'G',
        code: 71,
    };
    public static H: IKey = {
        name: 'H',
        code: 72,
    };
    public static J: IKey = {
        name: 'J',
        code: 74,
    };
    public static K: IKey = {
        name: 'K',
        code: 75,
    };
    public static L: IKey = {
        name: 'L',
        code: 76,
    };
    public static Z: IKey = {
        name: 'Z',
        code: 90,
    };
    public static X: IKey = {
        name: 'X',
        code: 88,
    };
    public static C: IKey = {
        name: 'C',
        code: 67,
    };
    public static V: IKey = {
        name: 'V',
        code: 86,
    };
    public static B: IKey = {
        name: 'B',
        code: 66,
    };
    public static N: IKey = {
        name: 'N',
        code: 78,
    };
    public static M: IKey = {
        name: 'M',
        code: 77,
    };
    public static Shift: IKeyModifier = {
        name: 'Shift',
        code: 16,
    };
    public static Control: IKeyModifier = {
        name: 'Control',
        code: 17,
    };
    public static Alt: IKeyModifier = {
        name: 'Alt',
        code: 18,
    };
    public static Enter: IKey = {
        name: 'Enter',
        code: 13,
    };
    public static ArrowLeft: IKey = {
        name: 'ArrowLeft',
        code: 37,
    };
    public static ArrowDown: IKey = {
        name: 'ArrowDown',
        code: 40,
    };
    public static ArrowRight: IKey = {
        name: 'ArrowRight',
        code: 39,
    };
    public static ArrowUp: IKey = {
        name: 'ArrowUp',
        code: 38,
    };
    public static Space: IKey = {
        name: ' ',
        code: 32,
    };
    public static Tab: IKey = {
        name: 'Tab',
        code: 9,
    };
    public static Escape: IKey = {
        name: 'Escape',
        code: 27,
    };
}

export class FakeFileList implements FileList {
    [index: number]: File;

    public get length() {
        return this.files.length;
    }

    constructor(public files: File[] = []) {
        files.forEach((file, idx) => {
            this[idx] = file;
        });
    }

    public item(index: number) {
        return this[index];
    }

    public add(...files: File[]) {
        files.forEach(file => {
            this[this.files.length] = file;
            this.files.push(file);
        });
    }
}

export interface IDropEvent extends Event {
    dataTransfer: {
        files: FakeFileList,
    };
}

export class EventGenerator {
    static cursor = {
        ref: null as HTMLElement,
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

    static keyDown(key: IKey | string, modifier?: IKeyModifier): KeyboardEvent {
        return EventGenerator.key('keydown', key, modifier);
    }

    static keyUp(key: IKey | string, modifier?: IKeyModifier): KeyboardEvent {
        return EventGenerator.key('keyup', key, modifier);
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

    private static key(type: string, key: IKey | string, modifier = {} as IKeyModifier) {
        const safeKey = EventGenerator.getKey(key) as IKey;
        const options: KeyboardEventInit = {
            code: `${safeKey.code}`,
            key: safeKey.name,
            shiftKey: modifier === Key.Shift,
            altKey: modifier === Key.Alt,
            ctrlKey: modifier === Key.Control,
        };
        return new KeyboardEvent(type, options);
    }

    private static getKey(key: IKey | string): IKey {
        if (typeof key === 'string') {
            const internalKey: IKey = Key[key];
            if (!internalKey) {
                throw new Error(`Key definition for ${key} does not exist!`);
            }
            return internalKey;
        } else {
            return key as IKey;
        }
    }
}
