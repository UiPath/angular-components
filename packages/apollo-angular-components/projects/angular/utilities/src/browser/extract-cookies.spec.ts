import { extractCookies } from './extract-cookies';

describe('Util(browser): extractCookies', () => {
    it('should an empty object if no cookies are set', () => {
        const matchMediaSpy = spyOnProperty(document, 'cookie', 'get');
        matchMediaSpy.and.returnValue('');

        expect(extractCookies()).toEqual({});
    });

    it('should return an object with ONE property', () => {
        const matchMediaSpy = spyOnProperty(document, 'cookie', 'get');
        matchMediaSpy.and.returnValue('myCookie=1234');

        expect(extractCookies()).toEqual({ myCookie: '1234' });
    });

    it('should return an object with MULTIPLE properties', () => {
        const matchMediaSpy = spyOnProperty(document, 'cookie', 'get');
        matchMediaSpy.and.returnValue('myCookie=1234; myCookie2=XXXYYY; myCookie3=https://whatever.org');
        console.log(extractCookies());
        expect(extractCookies()).toEqual({
            myCookie: '1234',
            myCookie2: 'XXXYYY',
            myCookie3: 'https://whatever.org',
        });
    });
});

