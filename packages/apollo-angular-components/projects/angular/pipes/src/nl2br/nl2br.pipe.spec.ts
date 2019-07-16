import { UiNl2BrPipe } from './nl2br.pipe';

describe('Pipe: UiNl2Br', () => {
    // This pipe is a pure, stateless function so no need for BeforeEach
    const pipe = new UiNl2BrPipe();

    it('should return null when there is no value', () => {
        expect(pipe.transform('')).toBeNull();
        expect(pipe.transform(undefined!)).toBeNull();
        expect(pipe.transform(null!)).toBeNull();
    });

    it('should transform \r\n to <br/>', () => {
        expect(pipe.transform('\r\ntest\r\ntest')).toBe('<br/>test<br/>test');
    });

    it('should transform \r to <br/>', () => {
        expect(pipe.transform('\rtest\rtest')).toBe('<br/>test<br/>test');
    });

    it('should transform \n to <br/>', () => {
        expect(pipe.transform('\ntest\ntest')).toBe('<br/>test<br/>test');
    });

    it('should work with mixed line endings', () => {
        expect(pipe.transform('\r\ntest\rtest\n')).toBe('<br/>test<br/>test<br/>');
    });
});
