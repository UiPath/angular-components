import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';

import { GridPage } from './grid.page';

describe('GridPage', () => {
    let component: GridPage;
    let fixture: ComponentFixture<GridPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GridPage],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GridPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
