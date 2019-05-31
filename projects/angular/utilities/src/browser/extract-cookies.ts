import { isBrowserPlatform } from './is-browser-platform';

/**
 * Reads the current application cookies.
 *
 * @export
 * @returns A map with all the cookie KV pairs.
 */
export function extractCookies(): Record<string, string> {
    if (!isBrowserPlatform()) { return {}; }

    return document.cookie.split('; ')
        .reduce((cookieMap, cookie) => {
            const [key, value] = cookie.split('=');

            if (!key) { return cookieMap; }

            cookieMap[key] = value;
            return cookieMap;
        }, {} as Record<string, string>);
}
