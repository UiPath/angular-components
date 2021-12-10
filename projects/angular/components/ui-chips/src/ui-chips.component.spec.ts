import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';

import { UiChipsComponent } from './ui-chips.component';

describe('UiChipsComponent', () => {
  let component: UiChipsComponent;
  let fixture: ComponentFixture<UiChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UiChipsComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UiChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
