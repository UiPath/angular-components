import * as faker from 'faker';
import {
    a11y,
    axe,
} from 'projects/angular/axe-helper';

import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EventGenerator } from '@uipath/angular/testing';
import { asyncOf } from '@uipath/angular/utilities';

import {
    ICON_MAP,
    panelClass,
    SnackbarAction,
    SnackBarType,
    UiMatSnackBarConfig,
    UiSnackBarService,
    UI_MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from './ui-snackbar.component';
import { UiSnackBarModule } from './ui-snackbar.module';

const DEFAULT_DURATION = 2500;
const ANGULAR_ARIA_DELAY = 150;
@Component({
    template: `<ng-template #richContent>
                <div class="rich-class">Some Rich</div>
                <a href="#">content</a>
               </ng-template>`,
})
export class SnackBarFixtureComponent {
    @ViewChild('richContent', { static: true })
    public richContent!: TemplateRef<any>;

    constructor(public service: UiSnackBarService) { }
}

describe('Service: UiSnackBarService', () => {
    let service: UiSnackBarService;
    let overlayContainer: OverlayContainer;
    let fixture: ComponentFixture<SnackBarFixtureComponent>;
    let securitySettings: UiMatSnackBarConfig;

    const getSnack = () =>
        overlayContainer
            .getContainerElement()
            .querySelector('.mat-snack-bar-container');

    beforeEach(waitForAsync(() => {
        securitySettings = {
            restrictHtml: false,
        };

        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                UiSnackBarModule,
            ],
            providers: [
                {
                    provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
                    useValue: {
                        duration: DEFAULT_DURATION,
                    },
                },
                {
                    provide: UI_MAT_SNACK_BAR_DEFAULT_OPTIONS,
                    useFactory: () => securitySettings,
                },
            ],
            declarations: [
                SnackBarFixtureComponent,
            ],
        });

        overlayContainer = TestBed.inject<OverlayContainer>(OverlayContainer);
        fixture = TestBed.createComponent(SnackBarFixtureComponent);
        service = fixture.componentInstance.service;
    }));

    afterEach(async () => {
        service.clear();
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    ([
        SnackBarType.Info,
        SnackBarType.Success,
        SnackBarType.Warning,
        SnackBarType.Error,
    ] as const).forEach(type => {
        describe(`Type: ${type}`, () => {
            [
                { label: 'Via: show method', useGenericShow: true },
                { label: `Via: ${type} method`, useGenericShow: false },
            ].forEach(viaCase => {
                describe(viaCase.label, () => {
                    let showSnackbar: SnackbarAction;

                    beforeEach(() => {
                        const showMethodAdapter: SnackbarAction = (message, configuration) =>
                            service.show(message, { ...configuration, type });
                        showSnackbar = viaCase.useGenericShow
                            ? showMethodAdapter
                            : service[type];
                    });

                    a11y.suite((runOptions) => {
                        a11y.it('should have no violations', async () => {
                            showSnackbar(faker.lorem.paragraph());
                            const snack = getSnack();
                            // Angular attaches aria-hidden to a snackbar right when shown, and removes it after a delay.
                            await asyncOf(null, ANGULAR_ARIA_DELAY).toPromise();
                            expect(await axe(snack as Element, runOptions)).toHaveNoViolations();
                        });
                    });

                    it('should display the correct message', () => {
                        const message = faker.lorem.paragraph();

                        showSnackbar(message);

                        const snack = getSnack();
                        expect(snack).toBeDefined();
                        expect(snack!.querySelector<HTMLElement>('.ui-snackbar-message span')!.innerText.trim()).toBe(message);
                    });

                    it('should display the correct type', () => {
                        showSnackbar(faker.lorem.paragraph());

                        const snack = getSnack();
                        expect(snack).toBeDefined();
                        expect(snack!.classList.contains(panelClass(type))).toBeTruthy();
                    });

                    it('should display the correct icon', () => {
                        showSnackbar(faker.lorem.paragraph());

                        const snack = getSnack()!;
                        const icon = snack.querySelector<HTMLElement>('.ui-snackbar-message mat-icon');

                        expect(icon).toBeDefined();
                        expect(icon!.innerText).toEqual(ICON_MAP.get(type)!);
                    });

                    it('should display the close icon', () => {
                        showSnackbar(faker.lorem.paragraph());

                        const snack = getSnack()!;
                        const icon = snack.querySelector<HTMLElement>('.ui-snackbar-dismiss mat-icon');

                        expect(icon).toBeDefined();
                        expect(icon!.innerText).toEqual('close');
                    });

                    it('should display an action button', () => {
                        showSnackbar(faker.lorem.paragraph(), { actionMessage: 'my-custom-button' });

                        const snack = getSnack()!;
                        const button = snack.querySelector<HTMLElement>('.ui-snackbar-action');

                        expect(button).toBeDefined();
                        expect(button!.innerText).toEqual('my-custom-button');
                    });

                    it('should emit `dismissedByAction:true` on action click', async (done) => {

                        showSnackbar(faker.lorem.paragraph(), { actionMessage: 'my-custom-button' })
                            .afterDismissed()
                            .subscribe(response => {

                                expect(response.dismissedByAction).toBeTrue(`dismissedByAction is false`);
                                done();
                            });

                        const button = getSnack()!.querySelector<HTMLElement>('.ui-snackbar-action')!;

                        button.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();
                    });

                    it('should emit `dismissedByAction:false` on close icon click', async (done) => {

                        showSnackbar(faker.lorem.paragraph(), { actionMessage: 'my-custom-button' })
                            .afterDismissed()
                            .subscribe(response => {

                                expect(response.dismissedByAction).toBeFalse(`dismissedByAction is true`);
                                done();
                            });
                        const close = getSnack()!.querySelector<HTMLElement>('.ui-snackbar-close')!;

                        close.dispatchEvent(EventGenerator.click);
                        fixture.detectChanges();
                    });

                    it('should dismiss after 1000ms', fakeAsync(() => {

                        const timeout = 1000;
                        showSnackbar(faker.lorem.paragraph(), { duration: timeout });
                        fixture.detectChanges();

                        tick(timeout - 1);
                        const snack = getSnack();
                        expect(snack).toBeDefined();

                        tick(1);
                        const snackAfterTimeout = getSnack();
                        expect(snackAfterTimeout).toBeNull();
                    }));

                    it('should dismiss after 5000ms and then after 1000ms', fakeAsync(() => {

                        const firstTimeout = 5000;
                        showSnackbar(faker.lorem.paragraph(), { duration: firstTimeout });
                        fixture.detectChanges();

                        tick(firstTimeout - 1);
                        const firstSnack = getSnack();
                        expect(firstSnack).toBeDefined();

                        tick(1);
                        const firstSnackAfterTimeout = getSnack();
                        expect(firstSnackAfterTimeout).toBeNull();

                        const secondTimeout = 1000;
                        showSnackbar(faker.lorem.paragraph(), { duration: secondTimeout });
                        fixture.detectChanges();

                        tick(secondTimeout - 1);
                        const secondSnack = getSnack();
                        expect(secondSnack).toBeDefined();

                        tick(1);
                        const secondSnackAfterTimeout = getSnack();
                        expect(secondSnackAfterTimeout).toBeNull();
                    }));

                    it('should dismiss after the default duration', fakeAsync(() => {

                        showSnackbar(faker.lorem.paragraph());
                        fixture.detectChanges();

                        tick(DEFAULT_DURATION - 1);
                        const snackBeforeTimeout = getSnack();
                        expect(snackBeforeTimeout).not.toBeNull();

                        tick(1);
                        const snackAfterTimeout = getSnack();
                        expect(snackAfterTimeout).toBeNull();
                    }));

                    it('should not dismiss after the default duration if the duration is zero', fakeAsync(() => {

                        showSnackbar(faker.lorem.paragraph(), { duration: 0 });
                        fixture.detectChanges();

                        tick(DEFAULT_DURATION + 1);

                        const snackAfterDefaultTimeout = getSnack();
                        expect(snackAfterDefaultTimeout).not.toBeNull();
                    }));
                });
            });
        });

    });

    describe(`Type: None`, () => {
        it('should display a snack type None if called show with no options', () => {
            service.show(faker.lorem.paragraph());

            const snack = getSnack();
            expect(snack).toBeDefined();
            expect(snack!.classList.contains(panelClass(SnackBarType.None))).toBeTruthy();
        });

        it('should display a snack with no icon if called show with no options', () => {
            service.show(faker.lorem.paragraph());

            const snack = getSnack();
            expect(snack).toBeDefined();
            expect(snack!.querySelector<HTMLElement>('.ui-snackbar-message mat-icon')).toBeNull();
        });

        it('should display a snack with custom icon', () => {
            service.show(faker.lorem.paragraph(), { icon: 'home' });

            const snack = getSnack()!;
            expect(snack).toBeDefined();

            const icon = snack.querySelector<HTMLElement>('.ui-snackbar-message mat-icon');

            expect(icon).toBeDefined();
            expect(icon!.innerText).toEqual('home');
        });

        it('should display the close icon', () => {
            service.show(faker.lorem.paragraph());

            const snack = getSnack()!;
            const icon = snack.querySelector<HTMLElement>('.ui-snackbar-dismiss mat-icon');

            expect(icon).toBeDefined();
            expect(icon!.innerText).toEqual('close');
        });
    });

    it('should break new lines when displaying content', () => {
        const lineCount = 5;
        const lines = faker.lorem.lines(lineCount);

        service.show(lines);

        const snack = getSnack();
        expect(snack).not.toBeNull();
        expect(snack!.querySelectorAll('br').length).toEqual(lineCount - 1);
    });

    it('should clear the snackbar', async () => {
        service.show(faker.random.word());

        const snack = getSnack();
        expect(snack).not.toBeNull();

        service.clear();
        fixture.detectChanges();
        await fixture.whenStable();

        const snackAfterClear = getSnack();
        expect(snackAfterClear).toBeNull();
    });

    it('should show rich context via template', () => {
        // make sure the template is initialized
        fixture.detectChanges();

        service.success(fixture.componentInstance.richContent);
        const snack = getSnack()!;

        expect(snack).not.toBeNull();
        expect(snack.querySelectorAll('div.rich-class').length).toEqual(1);
        expect(snack.querySelectorAll('a').length).toEqual(1);
    });

    it('should REMOVE html from the message', () => {
        securitySettings.restrictHtml = true;
        fixture = TestBed.createComponent(SnackBarFixtureComponent);
        service = fixture.componentInstance.service;

        service.show(`
            <a id="injected-link" href="#some-link">a link text</a>
            <img id="injected-image" src="invalid" onerror=callError()>
            hello world
        `);

        const snack = getSnack();

        expect(snack!.querySelectorAll('a').length).toEqual(0, 'an anchor creeped into the message');
        expect(snack!.querySelectorAll('img').length).toEqual(0, 'an img creeped into the message');
    });
});
