export interface IKey {
    code: number;
    name: string;
}

export interface IKeyModifier extends IKey {
    code: number;
    name: 'Shift' | 'Control' | 'Alt';
}

export class Key implements Record<keyof Key, IKey> {
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
