import { isInternetExplorer } from './is-internet-explorer';

const IE_10 = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)';
const IE_11 = 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko';
const CHROME_74 = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36';
const FIREFOX_67 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0';
// tslint:disable-next-line: max-line-length
const EDGE_76 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3786.0 Safari/537.36 Edg/76.0.155.0';
// tslint:disable-next-line: max-line-length
const EDGE_44 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17704';

describe('Util(browser): isInternetExplorer', () => {
    it('should identify IE10', () => {
        const userAgentSpy = spyOnProperty(window.navigator, 'userAgent', 'get');
        userAgentSpy.and.returnValue(IE_10);

        expect(isInternetExplorer()).toEqual(true);
    });

    it('should identify IE11', () => {
        const userAgentSpy = spyOnProperty(window.navigator, 'userAgent', 'get');
        userAgentSpy.and.returnValue(IE_11);

        expect(isInternetExplorer()).toEqual(true);
    });

    it('should NOT identify Chrome', () => {
        const userAgentSpy = spyOnProperty(window.navigator, 'userAgent', 'get');
        userAgentSpy.and.returnValue(CHROME_74);

        expect(isInternetExplorer()).toEqual(false);
    });

    it('should NOT identify Firefox', () => {
        const userAgentSpy = spyOnProperty(window.navigator, 'userAgent', 'get');
        userAgentSpy.and.returnValue(FIREFOX_67);

        expect(isInternetExplorer()).toEqual(false);
    });

    it('should NOT identify Edge Chromium', () => {
        const userAgentSpy = spyOnProperty(window.navigator, 'userAgent', 'get');
        userAgentSpy.and.returnValue(EDGE_76);

        expect(isInternetExplorer()).toEqual(false);
    });

    it('should NOT identify Edge', () => {
        const userAgentSpy = spyOnProperty(window.navigator, 'userAgent', 'get');
        userAgentSpy.and.returnValue(EDGE_44);

        expect(isInternetExplorer()).toEqual(false);
    });
});
