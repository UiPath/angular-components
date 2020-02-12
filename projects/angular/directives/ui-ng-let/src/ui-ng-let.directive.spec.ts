import {
    Component,
    ElementRef,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';

import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { UiNgLetModule } from './ui-ng-let.module';

describe('Directive: UiClipboard', () => {
    @Component({
        template: `
            <ng-container *ngLet="data$ | async as data">
                <div #child>
                    <p>{{data?.value}}</p>
                </div>
            </ng-container>
        `,
    })
    class NgLetStaticFixtureComponent {
        @ViewChild('child', {
            static: true,
        })
        public child!: ElementRef<HTMLDivElement>;

        public data$ = of({
            value: 'smth',
        }).pipe(delay(100));
    }
    describe('QueryStrategy: static', () => {
        let fixture: ComponentFixture<NgLetStaticFixtureComponent>;
        let component: NgLetStaticFixtureComponent;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiNgLetModule,
                ],
                declarations: [
                    NgLetStaticFixtureComponent,
                ],
            });
            fixture = TestBed.createComponent(NgLetStaticFixtureComponent);
            component = fixture.componentInstance;

            fixture.detectChanges();
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should allow the content to be queried onInit (static: true)', async () => {
            expect(component.child).toBeDefined();

            await fixture.whenStable();

            expect(component.child.nativeElement.innerText).toEqual('');

            fixture.detectChanges();

            expect(component.child).toBeDefined();
            expect(component.child.nativeElement.innerText).toEqual('smth');
        });
    });

    @Component({
        template: `
            <ng-container *ngLet="data$ | async as data">
                <div #child>
                    <p>{{data?.value}}</p>
                </div>
            </ng-container>
        `,
    })
    class NgLetDynamicFixtureComponent {
        @ViewChild('child')
        public child!: ElementRef<HTMLDivElement>;

        public data$ = of({
            value: 'smth',
        }).pipe(delay(100));
    }
    describe('QueryStrategy: static', () => {
        let fixture: ComponentFixture<NgLetDynamicFixtureComponent>;
        let component: NgLetDynamicFixtureComponent;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiNgLetModule,
                ],
                declarations: [
                    NgLetDynamicFixtureComponent,
                ],
            });
            fixture = TestBed.createComponent(NgLetDynamicFixtureComponent);
            component = fixture.componentInstance;

            fixture.detectChanges();
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should allow the content to be queried on afterViewInit (static: false)', async () => {
            expect(component.child).toBeDefined();

            await fixture.whenStable();

            expect(component.child.nativeElement.innerText).toEqual('');

            fixture.detectChanges();

            expect(component.child).toBeDefined();
            expect(component.child.nativeElement.innerText).toEqual('smth');
        });
    });
});
