import { Component } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EventGenerator } from '@uipath/angular/testing';

import { Subject } from 'rxjs';
import {
    finalize,
    first,
} from 'rxjs/operators';

import { UiClipboardModule } from './ui-clipboard.module';

@Component({
    template: `
        <input #myInput
               [value]="text" />
        <button [uiClipboard]="myInput"
                (clipboardSuccess)="onClipboardCopy($event)"
                (clipboardError)="onClipboardError($event)">
                Copy!
        </button>
    `,
})
class ClipboardFixtureComponent {
    public text = 'qwertyiop';
    public event$ = new Subject<{
        type: 'error' | 'success',
        ev: ClipboardJS.Event,
    }>();

    public onClipboardCopy(ev: ClipboardJS.Event) {
        console.log('success', ev);
        this.event$.next({
            type: 'success',
            ev,
        });
    }

    public onClipboardError(ev: ClipboardJS.Event) {
        console.log('error', ev);
        this.event$.next({
            type: 'error',
            ev,
        });
    }
}

describe('Directive: UiClipboard', () => {
    let component: ClipboardFixtureComponent;
    let fixture: ComponentFixture<ClipboardFixtureComponent>;
    let button: HTMLButtonElement;
    let execSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                UiClipboardModule,
            ],
            declarations: [
                ClipboardFixtureComponent,
            ],
        });
        fixture = TestBed.createComponent(ClipboardFixtureComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button')).nativeElement;
        execSpy = spyOn(document, 'execCommand');
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('State: success', () => {
        it('should emit success event when trigger is clicked', (done) => {
            execSpy.and.callFake(() => true);

            component.event$
                .pipe(
                    first(),
                    finalize(done),
                )
                .subscribe(output => {
                    expect(output.type).toEqual('success');
                    expect(output.ev).toBeDefined();
                    expect(output.ev.action).toEqual('copy');
                    expect(output.ev.trigger).toBe(button);
                    expect(output.ev.text).toBe(component.text);
                });

            button.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
        });
    });

    describe('State: error', () => {
        it('should emit an error if the execCommand returns false', (done) => {
            execSpy.and.callFake(() => false);

            component.event$
                .pipe(
                    first(),
                    finalize(done),
                )
                .subscribe(output => {
                    expect(output.type).toEqual('error');
                    expect(output.ev).toBeDefined();
                    expect(output.ev.action).toEqual('copy');
                    expect(output.ev.trigger).toBe(button);
                    expect(output.ev.text).toBe(component.text);
                });

            button.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
        });

        it('should emit error event when an error is thrown', (done) => {
            execSpy.and.throwError('ERROR');

            component.event$
                .pipe(
                    first(),
                    finalize(done),
                )
                .subscribe(output => {
                    expect(output.type).toEqual('error');
                    expect(output.ev).toBeDefined();
                    expect(output.ev.action).toEqual('copy');
                    expect(output.ev.trigger).toBe(button);
                    expect(output.ev.text).toBe(component.text);
                });

            button.dispatchEvent(EventGenerator.click);
            fixture.detectChanges();
        });
    });
});
