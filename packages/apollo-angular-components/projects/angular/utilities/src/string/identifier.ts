/**
 * @ignore
 */
const CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random string identifier.
 *
 * @export
 * @param [length=16] The desired identifier length.
 * @returns The generated string identifier.
 */
export function identifier(length = 16): string {
    return Array(length)
        .fill(void 0)
        .map(() => CHARMAP.charAt(Math.floor(Math.random() * CHARMAP.length)))
        .join('');
}
