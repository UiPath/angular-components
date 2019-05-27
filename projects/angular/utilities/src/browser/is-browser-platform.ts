/**
 * Determines if the current platform is running on a browser platform.
 *
*/
export function isBrowserPlatform() {
    return typeof window === 'object';
}
