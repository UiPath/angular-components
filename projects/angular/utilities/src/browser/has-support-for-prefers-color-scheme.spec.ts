import { hasSupportForPrefersColorScheme } from './has-support-for-prefers-color-scheme';

describe('Util(browser): hasSupportForPrefersColorScheme', () => {
    it('should return true if the media query matches', () => {
        const matchMediaSpy = spyOn(window, 'matchMedia');
        matchMediaSpy.and.callFake(() => ({ matches: true } as MediaQueryList));

        expect(hasSupportForPrefersColorScheme()).toEqual(true);
    });

    it('should return false if the media query does NOT match', () => {
        const matchMediaSpy = spyOn(window, 'matchMedia');
        matchMediaSpy.and.callFake(() => ({ matches: false } as MediaQueryList));

        expect(hasSupportForPrefersColorScheme()).toEqual(false);
    });
});
