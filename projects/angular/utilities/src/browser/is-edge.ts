import { isBrowserPlatform } from './is-browser-platform';

/**
 * Determines if the current agent is Edge.
 *
 * @export
 * @returns Returns `true` if the current browser is `Edge`.
 */
export function isEdge(): boolean {
    if (!isBrowserPlatform()) { return false; }

    const userAgent = window.navigator.userAgent;

    return userAgent.indexOf('Edge') > -1;
}
