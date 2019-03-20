export /**
 * Returns a map with all the cookie KV pairs.
 *
 * @returns {Record<string, string>}
 */
    const extractCookies = (): Record<string, string> =>
        document.cookie.split('; ')
            .reduce((cookieMap, cookie) => {
                const [key, value] = cookie.split('=');
                cookieMap[key] = value;
                return cookieMap;
            }, {});
