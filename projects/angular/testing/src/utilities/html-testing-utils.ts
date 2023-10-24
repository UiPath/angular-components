import { EventGenerator } from './event-generator';

export class HtmlTestingUtils {
    private _rootEl: HTMLElement;

    constructor(element: HTMLElement) {
        this._rootEl = element;
    }

    getElement = <T extends HTMLElement>(selector: string, element: HTMLElement = this._rootEl) =>
        element.querySelector(selector) as T | null;

    isToggleChecked = (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(selector, element)?.classList.contains('mat-checked');

    toggleElement = (className: string) => (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(`${selector} .${className}`, element)?.dispatchEvent(EventGenerator.click);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    toggleCheckbox = this.toggleElement('mat-checkbox-label');

    // eslint-disable-next-line @typescript-eslint/member-ordering
    toggleSlider = this.toggleElement('mat-slide-toggle-label');

    setInput = (selector: string, value: any, element: HTMLElement = this._rootEl) => {
        const input = this.getElement<HTMLInputElement>(selector, element)!;
        input.value = value;
        input.dispatchEvent(EventGenerator.input());
        return input;
    };

    changeInput = (selector: string, value: any, element: HTMLElement = this._rootEl) => {
        const input = this.getElement<HTMLInputElement>(selector, element)!;
        input.value = value;

        const changeEvent = EventGenerator.change();
        const targetElement = changeEvent.target as any as { value: number };

        targetElement.value = value;
        input.dispatchEvent(changeEvent);
        input.dispatchEvent(EventGenerator.input());
        return input;
    };

    click = (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(selector, element)!.dispatchEvent(EventGenerator.click);
}
