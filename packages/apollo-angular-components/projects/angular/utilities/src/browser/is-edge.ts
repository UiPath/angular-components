export /**
 * Determines if the current agent is Internet Explorer.
 *
 * @returns {boolean}
 */
    const isEdge = (): boolean => {
        const userAgent = window.navigator.userAgent;

        return userAgent.indexOf('Edge') > -1;
    };
