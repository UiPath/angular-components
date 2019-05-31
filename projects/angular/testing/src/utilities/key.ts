/**
 * Key schema.
 *
 * @export
 */
export interface IKey {
    /**
     * The code associated to the current `key`.
     */
    code: number;
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
    public static q: IKey = {
        name: 'q',
        code: 81,
    };
    /**
     * Metadata for key `w`.
     *
     */
    public static w: IKey = {
        name: 'w',
        code: 87,
    };
    /**
     * Metadata for key `e`.
     *
     */
    public static e: IKey = {
        name: 'e',
        code: 69,
    };
    /**
     * Metadata for key `r`.
     *
     */
    public static r: IKey = {
        name: 'r',
        code: 82,
    };
    /**
     * Metadata for key `t`.
     *
     */
    public static t: IKey = {
        name: 't',
        code: 84,
    };
    /**
     * Metadata for key `y`.
     *
     */
    public static y: IKey = {
        name: 'y',
        code: 89,
    };
    /**
     * Metadata for key `u`.
     *
     */
    public static u: IKey = {
        name: 'u',
        code: 85,
    };
    /**
     * Metadata for key `i`.
     *
     */
    public static i: IKey = {
        name: 'i',
        code: 73,
    };
    /**
     * Metadata for key `o`.
     *
     */
    public static o: IKey = {
        name: 'o',
        code: 79,
    };
    /**
     * Metadata for key `p`.
     *
     */
    public static p: IKey = {
        name: 'p',
        code: 80,
    };
    /**
     * Metadata for key `a`.
     *
     */
    public static a: IKey = {
        name: 'a',
        code: 65,
    };
    /**
     * Metadata for key `s`.
     *
     */
    public static s: IKey = {
        name: 's',
        code: 83,
    };
    /**
     * Metadata for key `d`.
     *
     */
    public static d: IKey = {
        name: 'd',
        code: 68,
    };
    /**
     * Metadata for key `f`.
     *
     */
    public static f: IKey = {
        name: 'f',
        code: 70,
    };
    /**
     * Metadata for key `g`.
     *
     */
    public static g: IKey = {
        name: 'g',
        code: 71,
    };
    /**
     * Metadata for key `h`.
     *
     */
    public static h: IKey = {
        name: 'h',
        code: 72,
    };
    /**
     * Metadata for key `j`.
     *
     */
    public static j: IKey = {
        name: 'j',
        code: 74,
    };
    /**
     * Metadata for key `k`.
     *
     */
    public static k: IKey = {
        name: 'k',
        code: 75,
    };
    /**
     * Metadata for key `l`.
     *
     */
    public static l: IKey = {
        name: 'l',
        code: 76,
    };
    /**
     * Metadata for key `z`.
     *
     */
    public static z: IKey = {
        name: 'z',
        code: 90,
    };
    /**
     * Metadata for key `x`.
     *
     */
    public static x: IKey = {
        name: 'x',
        code: 88,
    };
    /**
     * Metadata for key `c`.
     *
     */
    public static c: IKey = {
        name: 'c',
        code: 67,
    };
    /**
     * Metadata for key `v`.
     *
     */
    public static v: IKey = {
        name: 'v',
        code: 86,
    };
    /**
     * Metadata for key `b`.
     *
     */
    public static b: IKey = {
        name: 'b',
        code: 66,
    };
    /**
     * Metadata for key `n`.
     *
     */
    public static n: IKey = {
        name: 'n',
        code: 78,
    };
    /**
     * Metadata for key `m`.
     *
     */
    public static m: IKey = {
        name: 'm',
        code: 77,
    };
    /**
     * Metadata for key `Q`.
     *
     */
    public static Q: IKey = {
        name: 'Q',
        code: 81,
    };
    /**
     * Metadata for key `W`.
     *
     */
    public static W: IKey = {
        name: 'W',
        code: 87,
    };
    /**
     * Metadata for key `E`.
     *
     */
    public static E: IKey = {
        name: 'E',
        code: 69,
    };
    /**
     * Metadata for key `R`.
     *
     */
    public static R: IKey = {
        name: 'R',
        code: 82,
    };
    /**
     * Metadata for key `T`.
     *
     */
    public static T: IKey = {
        name: 'T',
        code: 84,
    };
    /**
     * Metadata for key `Y`.
     *
     */
    public static Y: IKey = {
        name: 'Y',
        code: 89,
    };
    /**
     * Metadata for key `U`.
     *
     */
    public static U: IKey = {
        name: 'U',
        code: 85,
    };
    /**
     * Metadata for key `I`.
     *
     */
    public static I: IKey = {
        name: 'I',
        code: 73,
    };
    /**
     * Metadata for key `O`.
     *
     */
    public static O: IKey = {
        name: 'O',
        code: 79,
    };
    /**
     * Metadata for key `P`.
     *
     */
    public static P: IKey = {
        name: 'P',
        code: 80,
    };
    /**
     * Metadata for key `A`.
     *
     */
    public static A: IKey = {
        name: 'A',
        code: 65,
    };
    /**
     * Metadata for key `S`.
     *
     */
    public static S: IKey = {
        name: 'S',
        code: 83,
    };
    /**
     * Metadata for key `D`.
     *
     */
    public static D: IKey = {
        name: 'D',
        code: 68,
    };
    /**
     * Metadata for key `F`.
     *
     */
    public static F: IKey = {
        name: 'F',
        code: 70,
    };
    /**
     * Metadata for key `G`.
     *
     */
    public static G: IKey = {
        name: 'G',
        code: 71,
    };
    /**
     * Metadata for key `H`.
     *
     */
    public static H: IKey = {
        name: 'H',
        code: 72,
    };
    /**
     * Metadata for key `J`.
     *
     */
    public static J: IKey = {
        name: 'J',
        code: 74,
    };
    /**
     * Metadata for key `K`.
     *
     */
    public static K: IKey = {
        name: 'K',
        code: 75,
    };
    /**
     * Metadata for key `L`.
     *
     */
    public static L: IKey = {
        name: 'L',
        code: 76,
    };
    /**
     * Metadata for key `Z`.
     *
     */
    public static Z: IKey = {
        name: 'Z',
        code: 90,
    };
    /**
     * Metadata for key `X`.
     *
     */
    public static X: IKey = {
        name: 'X',
        code: 88,
    };
    /**
     * Metadata for key `C`.
     *
     */
    public static C: IKey = {
        name: 'C',
        code: 67,
    };
    /**
     * Metadata for key `V`.
     *
     */
    public static V: IKey = {
        name: 'V',
        code: 86,
    };
    /**
     * Metadata for key `B`.
     *
     */
    public static B: IKey = {
        name: 'B',
        code: 66,
    };
    /**
     * Metadata for key `N`.
     *
     */
    public static N: IKey = {
        name: 'N',
        code: 78,
    };
    /**
     * Metadata for key `M`.
     *
     */
    public static M: IKey = {
        name: 'M',
        code: 77,
    };
    /**
     * Metadata for key `Shift`.
     *
     */
    public static Shift: IKeyModifier = {
        name: 'Shift',
        code: 16,
    };
    /**
     * Metadata for key `Control`.
     *
     */
    public static Control: IKeyModifier = {
        name: 'Control',
        code: 17,
    };
    /**
     * Metadata for key `Alt`.
     *
     */
    public static Alt: IKeyModifier = {
        name: 'Alt',
        code: 18,
    };
    /**
     * Metadata for key `Enter`.
     *
     */
    public static Enter: IKey = {
        name: 'Enter',
        code: 13,
    };
    /**
     * Metadata for key `ArrowLeft`.
     *
     */
    public static ArrowLeft: IKey = {
        name: 'ArrowLeft',
        code: 37,
    };
    /**
     * Metadata for key `ArrowDown`.
     *
     */
    public static ArrowDown: IKey = {
        name: 'ArrowDown',
        code: 40,
    };
    /**
     * Metadata for key `ArrowRight`.
     *
     */
    public static ArrowRight: IKey = {
        name: 'ArrowRight',
        code: 39,
    };
    /**
     * Metadata for key `ArrowUp`.
     *
     */
    public static ArrowUp: IKey = {
        name: 'ArrowUp',
        code: 38,
    };
    /**
     * Metadata for key `Space`.
     *
     */
    public static Space: IKey = {
        name: ' ',
        code: 32,
    };
    /**
     * Metadata for key `Tab`.
     *
     */
    public static Tab: IKey = {
        name: 'Tab',
        code: 9,
    };
    /**
     * Metadata for key `Escape`.
     *
     */
    public static Escape: IKey = {
        name: 'Escape',
        code: 27,
    };
}
