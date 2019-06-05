import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';

import { UiScrollIntoViewDirective } from './ui-scroll-into-view.directive';

@Component({
    template: `<div [uiScrollIntoView]="editing"></div>`,
})
class TestScrollIntoViewComponent {
  @ViewChild(UiScrollIntoViewDirective, {
      static: true,
  })
    public directive!: UiScrollIntoViewDirective;

  public editing = false;
}

describe('Directive: ScrollIntoView', () => {
    let component: TestScrollIntoViewComponent;
    let fixture: ComponentFixture<TestScrollIntoViewComponent>;
    let scrollIfNeededSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestScrollIntoViewComponent,
                UiScrollIntoViewDirective,
            ],
        });
        fixture = TestBed.createComponent(TestScrollIntoViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        scrollIfNeededSpy = spyOn(component.directive, 'scrollIntoViewIfNeeded');
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should not call scrollIntoView() when flag is false', () => {
        fixture.detectChanges();

        expect(scrollIfNeededSpy).not.toHaveBeenCalled();
    });

    it('should call scrollIntoView() when flag is set to true', fakeAsync(() => {
        component.editing = true;
        fixture.detectChanges();
        tick();

        expect(scrollIfNeededSpy).toHaveBeenCalled();
    }));
});
