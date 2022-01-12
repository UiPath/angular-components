import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';

import { SuggestPageComponent } from './suggest.page';

describe('SuggestPage', () => {
  let component: SuggestPageComponent;
  let fixture: ComponentFixture<SuggestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuggestPageComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
