export /**
 * Determines if the current agent is Edge.
 *
 * @returns {boolean}
 */
    const isEdge = (): boolean => {
        const userAgent = window.navigator.userAgent;

        return userAgent.indexOf('Edge') > -1;
    };
