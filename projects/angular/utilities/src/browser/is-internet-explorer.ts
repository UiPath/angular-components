import { isBrowserPlatform } from './is-browser-platform';

/**
 * Determines if the current agent is Internet Explorer.
 *
 * @export
 * @returns Returns `true` if the current browser is `Internet Explorer`.
 */
export function isInternetExplorer(): boolean {
    if (!isBrowserPlatform()) { return false; }

    const userAgent = window.navigator.userAgent;

    // IE 10 or older => return version number
    const msie = userAgent.indexOf('MSIE ');
    if (msie > -1) { return true; }

    // IE 11 => return version number
    const trident = userAgent.indexOf('Trident/');
    if (trident > -1) { return true; }

    return false;
}
