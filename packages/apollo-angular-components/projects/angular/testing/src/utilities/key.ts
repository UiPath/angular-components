/**
 * Key schema.
 *
 * @export
 */
export interface IKey {
    /**
     * The keyCode associated to the current `key`.
     */
    keyCode: number;
    /**
     * The code associated to the current `key`.
     */
    code: string;
    /**
     * The friendly `name` of the current `key`.
     *
     */
    name: string;
}

/**
 * Key modifier schema.
 *
 * @export
 */
export interface IKeyModifier extends IKey {
    /**
     * The friendly `name` of the current modifier.
     *
     */
    name: 'Shift' | 'Control' | 'Alt';
}

/**
 * A complete collection of `keys` that can be used to emit fake events for testing.
 *
 * @export
 */
export class Key implements Record<keyof Key, IKey> {
    /**
     * Metadata for key `q`.
     *
     */
    static q: IKey = {
        name: 'q',
        code: 'KeyQ',
        keyCode: 81,
    };
    /**
     * Metadata for key `w`.
     *
     */
    static w: IKey = {
        name: 'w',
        code: 'KeyW',
        keyCode: 87,
    };
    /**
     * Metadata for key `e`.
     *
     */
    static e: IKey = {
        name: 'e',
        code: 'KeyE',
        keyCode: 69,
    };
    /**
     * Metadata for key `r`.
     *
     */
    static r: IKey = {
        name: 'r',
        code: 'KeyR',
        keyCode: 82,
    };
    /**
     * Metadata for key `t`.
     *
     */
    static t: IKey = {
        name: 't',
        code: 'KeyT',
        keyCode: 84,
    };
    /**
     * Metadata for key `y`.
     *
     */
    static y: IKey = {
        name: 'y',
        code: 'KeyY',
        keyCode: 89,
    };
    /**
     * Metadata for key `u`.
     *
     */
    static u: IKey = {
        name: 'u',
        code: 'KeyU',
        keyCode: 85,
    };
    /**
     * Metadata for key `i`.
     *
     */
    static i: IKey = {
        name: 'i',
        code: 'KeyI',
        keyCode: 73,
    };
    /**
     * Metadata for key `o`.
     *
     */
    static o: IKey = {
        name: 'o',
        code: 'KeyO',
        keyCode: 79,
    };
    /**
     * Metadata for key `p`.
     *
     */
    static p: IKey = {
        name: 'p',
        code: 'KeyP',
        keyCode: 80,
    };
    /**
     * Metadata for key `a`.
     *
     */
    static a: IKey = {
        name: 'a',
        code: 'KeyA',
        keyCode: 65,
    };
    /**
     * Metadata for key `s`.
     *
     */
    static s: IKey = {
        name: 's',
        code: 'KeyS',
        keyCode: 83,
    };
    /**
     * Metadata for key `d`.
     *
     */
    static d: IKey = {
        name: 'd',
        code: 'KeyD',
        keyCode: 68,
    };
    /**
     * Metadata for key `f`.
     *
     */
    static f: IKey = {
        name: 'f',
        code: 'KeyF',
        keyCode: 70,
    };
    /**
     * Metadata for key `g`.
     *
     */
    static g: IKey = {
        name: 'g',
        code: 'KeyG',
        keyCode: 71,
    };
    /**
     * Metadata for key `h`.
     *
     */
    static h: IKey = {
        name: 'h',
        code: 'KeyH',
        keyCode: 72,
    };
    /**
     * Metadata for key `j`.
     *
     */
    static j: IKey = {
        name: 'j',
        code: 'KeyJ',
        keyCode: 74,
    };
    /**
     * Metadata for key `k`.
     *
     */
    static k: IKey = {
        name: 'k',
        code: 'KeyK',
        keyCode: 75,
    };
    /**
     * Metadata for key `l`.
     *
     */
    static l: IKey = {
        name: 'l',
        code: 'KeyL',
        keyCode: 76,
    };
    /**
     * Metadata for key `z`.
     *
     */
    static z: IKey = {
        name: 'z',
        code: 'KeyZ',
        keyCode: 90,
    };
    /**
     * Metadata for key `x`.
     *
     */
    static x: IKey = {
        name: 'x',
        code: 'KeyX',
        keyCode: 88,
    };
    /**
     * Metadata for key `c`.
     *
     */
    static c: IKey = {
        name: 'c',
        code: 'KeyC',
        keyCode: 67,
    };
    /**
     * Metadata for key `v`.
     *
     */
    static v: IKey = {
        name: 'v',
        code: 'KeyV',
        keyCode: 86,
    };
    /**
     * Metadata for key `b`.
     *
     */
    static b: IKey = {
        name: 'b',
        code: 'KeyB',
        keyCode: 66,
    };
    /**
     * Metadata for key `n`.
     *
     */
    static n: IKey = {
        name: 'n',
        code: 'KeyN',
        keyCode: 78,
    };
    /**
     * Metadata for key `m`.
     *
     */
    static m: IKey = {
        name: 'm',
        code: 'KeyM',
        keyCode: 77,
    };
    /**
     * Metadata for key `Q`.
     *
     */
    static Q: IKey = {
        name: 'Q',
        code: 'KeyQ',
        keyCode: 81,
    };
    /**
     * Metadata for key `W`.
     *
     */
    static W: IKey = {
        name: 'W',
        code: 'KeyW',
        keyCode: 87,
    };
    /**
     * Metadata for key `E`.
     *
     */
    static E: IKey = {
        name: 'E',
        code: 'KeyE',
        keyCode: 69,
    };
    /**
     * Metadata for key `R`.
     *
     */
    static R: IKey = {
        name: 'R',
        code: 'KeyR',
        keyCode: 82,
    };
    /**
     * Metadata for key `T`.
     *
     */
    static T: IKey = {
        name: 'T',
        code: 'KeyT',
        keyCode: 84,
    };
    /**
     * Metadata for key `Y`.
     *
     */
    static Y: IKey = {
        name: 'Y',
        code: 'KeyY',
        keyCode: 89,
    };
    /**
     * Metadata for key `U`.
     *
     */
    static U: IKey = {
        name: 'U',
        code: 'KeyU',
        keyCode: 85,
    };
    /**
     * Metadata for key `I`.
     *
     */
    static I: IKey = {
        name: 'I',
        code: 'KeyI',
        keyCode: 73,
    };
    /**
     * Metadata for key `O`.
     *
     */
    static O: IKey = {
        name: 'O',
        code: 'KeyO',
        keyCode: 79,
    };
    /**
     * Metadata for key `P`.
     *
     */
    static P: IKey = {
        name: 'P',
        code: 'KeyP',
        keyCode: 80,
    };
    /**
     * Metadata for key `A`.
     *
     */
    static A: IKey = {
        name: 'A',
        code: 'KeyA',
        keyCode: 65,
    };
    /**
     * Metadata for key `S`.
     *
     */
    static S: IKey = {
        name: 'S',
        code: 'KeyS',
        keyCode: 83,
    };
    /**
     * Metadata for key `D`.
     *
     */
    static D: IKey = {
        name: 'D',
        code: 'KeyD',
        keyCode: 68,
    };
    /**
     * Metadata for key `F`.
     *
     */
    static F: IKey = {
        name: 'F',
        code: 'KeyF',
        keyCode: 70,
    };
    /**
     * Metadata for key `G`.
     *
     */
    static G: IKey = {
        name: 'G',
        code: 'KeyG',
        keyCode: 71,
    };
    /**
     * Metadata for key `H`.
     *
     */
    static H: IKey = {
        name: 'H',
        code: 'KeyH',
        keyCode: 72,
    };
    /**
     * Metadata for key `J`.
     *
     */
    static J: IKey = {
        name: 'J',
        code: 'KeyJ',
        keyCode: 74,
    };
    /**
     * Metadata for key `K`.
     *
     */
    static K: IKey = {
        name: 'K',
        code: 'KeyK',
        keyCode: 75,
    };
    /**
     * Metadata for key `L`.
     *
     */
    static L: IKey = {
        name: 'L',
        code: 'KeyL',
        keyCode: 76,
    };
    /**
     * Metadata for key `Z`.
     *
     */
    static Z: IKey = {
        name: 'Z',
        code: 'KeyZ',
        keyCode: 90,
    };
    /**
     * Metadata for key `X`.
     *
     */
    static X: IKey = {
        name: 'X',
        code: 'KeyX',
        keyCode: 88,
    };
    /**
     * Metadata for key `C`.
     *
     */
    static C: IKey = {
        name: 'C',
        code: 'KeyC',
        keyCode: 67,
    };
    /**
     * Metadata for key `V`.
     *
     */
    static V: IKey = {
        name: 'V',
        code: 'KeyV',
        keyCode: 86,
    };
    /**
     * Metadata for key `B`.
     *
     */
    static B: IKey = {
        name: 'B',
        code: 'KeyB',
        keyCode: 66,
    };
    /**
     * Metadata for key `N`.
     *
     */
    static N: IKey = {
        name: 'N',
        code: 'KeyN',
        keyCode: 78,
    };
    /**
     * Metadata for key `M`.
     *
     */
    static M: IKey = {
        name: 'M',
        code: 'KeyM',
        keyCode: 77,
    };
    /**
     * Metadata for key `Shift`.
     *
     */
    static Shift: IKeyModifier = {
        name: 'Shift',
        code: 'Shift',
        keyCode: 16,
    };
    /**
     * Metadata for key `Control`.
     *
     */
    static Control: IKeyModifier = {
        name: 'Control',
        code: 'Control',
        keyCode: 17,
    };
    /**
     * Metadata for key `Alt`.
     *
     */
    static Alt: IKeyModifier = {
        name: 'Alt',
        code: 'Alt',
        keyCode: 18,
    };
    /**
     * Metadata for key `Enter`.
     *
     */
    static Enter: IKey = {
        name: 'Enter',
        code: 'Enter',
        keyCode: 13,
    };
    /**
     * Metadata for key `ArrowLeft`.
     *
     */
    static ArrowLeft: IKey = {
        name: 'ArrowLeft',
        code: 'ArrowLeft',
        keyCode: 37,
    };
    /**
     * Metadata for key `ArrowDown`.
     *
     */
    static ArrowDown: IKey = {
        name: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40,
    };
    /**
     * Metadata for key `ArrowRight`.
     *
     */
    static ArrowRight: IKey = {
        name: 'ArrowRight',
        code: 'ArrowRight',
        keyCode: 39,
    };
    /**
     * Metadata for key `ArrowUp`.
     *
     */
    static ArrowUp: IKey = {
        name: 'ArrowUp',
        code: 'ArrowUp',
        keyCode: 38,
    };
    /**
     * Metadata for key `Space`.
     *
     */
    static Space: IKey = {
        name: ' ',
        code: 'Space',
        keyCode: 32,
    };
    /**
     * Metadata for key `Tab`.
     *
     */
    static Tab: IKey = {
        name: 'Tab',
        code: 'Tab',
        keyCode: 9,
    };
    /**
     * Metadata for key `Escape`.
     *
     */
    static Escape: IKey = {
        name: 'Escape',
        code: 'Escape',
        keyCode: 27,
    };
}
