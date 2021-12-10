import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipsPage } from './chips.page';

describe('ChipsPage', () => {
  let component: ChipsPage;
  let fixture: ComponentFixture<ChipsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChipsPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
