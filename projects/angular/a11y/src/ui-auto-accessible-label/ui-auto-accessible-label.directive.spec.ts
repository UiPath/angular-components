import { Component } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
    EMPTY,
    Observable,
    of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

import {
    DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE,
    MAT_TOOLTIP_MISSING_WARNING,
} from './ui-auto-accessible-label.directive';
import { UiAutoAccessibleLabelModule } from './ui-auto-accessible-label.module';

const enum ButtonType {
    Fab = 'mat-fab',
    MiniFab = 'mat-mini-fab',
    IconButton = 'mat-icon-button',
}

function describeTestsFor(buttonType: ButtonType) {
    @Component({
        template: `
    <button [matTooltip]="tooltip$ | async" ${buttonType}>
        <mat-icon>icon</mat-icon>
    </button>
    `,
    })
    class IconButtonAsyncTooltipFixtureComponent {
        public tooltip$: Observable<string> = EMPTY;
    }

    @Component({
        template: `
    <button ${buttonType}>
        <mat-icon>clear</mat-icon>
    </button>
    `,
    })
    class IconButtonWithoutTooltipFixtureComponent {
    }

    @Component({
        template: `
    <button ${buttonType} ${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE} [attr.aria-label]="ariaLabel">
        <mat-icon>icon</mat-icon>
    </button>
    `,
    })
    class IconButtonWithDisabledDirectiveFixtureComponent {
        ariaLabel?: string;
    }

    describe(`for ${buttonType}`, () => {
        const getButton = (fixture: ComponentFixture<unknown>) => fixture.debugElement.query(By.css('button'));
        let warn: jasmine.Spy<Console['warn']>;

        const createComponent: TestBed['createComponent'] = component => {
            TestBed.configureTestingModule({
                declarations: [
                    component,
                ],
            });

            return TestBed.createComponent(component);
        };

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    MatTooltipModule,
                    MatButtonModule,
                    MatIconModule,
                    UiAutoAccessibleLabelModule,
                ],
            });

            warn = spyOn(console, 'warn');
        });

        it(`should set the button's accessible label to the tooltip's content`, fakeAsync(() => {
            const tooltipDelay = 100, tooltip = 'Clear';

            const fixture = createComponent(IconButtonAsyncTooltipFixtureComponent);
            fixture.componentInstance.tooltip$ = of(tooltip).pipe(delay(tooltipDelay));
            const button = getButton(fixture).nativeElement;

            fixture.detectChanges();

            expect(warn).not.toHaveBeenCalled();
            expect(button).not.toHaveAttr('aria-label');

            tick(tooltipDelay - 1);
            fixture.detectChanges();
            expect(button).not.toHaveAttr('aria-label');

            tick(1);
            fixture.detectChanges();
            expect(button).toHaveAttr('aria-label', tooltip);

            fixture.destroy();
        }));

        it(`should log a warning if the button doesn't have a tooltip`, () => {
            const fixture = createComponent(IconButtonWithoutTooltipFixtureComponent);
            const button = getButton(fixture).nativeElement;

            fixture.detectChanges();

            expect(warn).toHaveBeenCalledWith(MAT_TOOLTIP_MISSING_WARNING, button);
            expect(button).not.toHaveAttr('aria-label');

            fixture.destroy();
        });

        it(`should disable itself if the ${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE} attribute is specified`, fakeAsync(() => {
            const ariaLabel = 'Clear';

            const fixture = createComponent(IconButtonWithDisabledDirectiveFixtureComponent);
            const button = getButton(fixture).nativeElement;

            fixture.detectChanges();

            expect(warn).not.toHaveBeenCalled();
            expect(button).not.toHaveAttr('aria-label');

            fixture.componentInstance.ariaLabel = ariaLabel;
            fixture.detectChanges();
            expect(button).toHaveAttr('aria-label', ariaLabel);

            fixture.destroy();
        }));
    });
}

describe('Directive: UiAutoAccessibleLabel', () => {
    describeTestsFor(ButtonType.Fab);
    describeTestsFor(ButtonType.MiniFab);
    describeTestsFor(ButtonType.IconButton);
});
