import { isBrowserPlatform } from './is-browser-platform';

/**
 * Determines if the browsers can read the OS theme preference.
 *
 * @export
 * @returns Returns `true` if the app can be themed according to the user OS preference.
 */
export function hasSupportForPrefersColorScheme() {
    if (!isBrowserPlatform()) { return false; }

    return !!window.matchMedia && (
        window.matchMedia('(prefers-color-scheme: light)').matches ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
}
