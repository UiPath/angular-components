export /**
 * Determines if the current agent is Internet Explorer.
 *
 * @returns {boolean}
 */
    const isInternetExplorer = (): boolean => {
        const userAgent = window.navigator.userAgent;

        // IE 10 or older => return version number
        const msie = userAgent.indexOf('MSIE ');
        if (msie > -1) { return true; }

        // IE 11 => return version number
        const trident = userAgent.indexOf('Trident/');
        if (trident > -1) { return true; }

        return false;
    };
