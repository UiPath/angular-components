/**
 * Determines if the current platform is a browser.
 *
*/
export function isBrowserPlatform() {
    return typeof window === 'object';
}
