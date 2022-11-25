import {
  Component, NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture, TestBed,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { range } from 'lodash-es';
import { UiTreeItemModule } from './ui-tree-item.module';

@Component({
  template: `<ui-tree-item
  [node]="node"
  [isSelected]="isSelected"
  [isExpanded]="isExpanded"
  [loading]="loading"
  (selected)="selected()"
  (expanded)="expanded()">
    {{node.name}}
  </ui-tree-item>`,
})
export class TestHostComponent {
  node = {
    level: 0,
    name: 'nodename',
  };
  isSelected = false;
  isExpanded = false;
  loading = false;
  expanded = jasmine.createSpy();
  selected = jasmine.createSpy();
}

describe('UiTreeItemComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UiTreeItemModule],
      declarations: [TestHostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add correct level class', () => {
    range(1, 5).forEach(level => {
      component.node = { level } as any;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.tree-item-container').classList).toContain(`node-level-${level}`);
    });
  });

  it('should correctly add selected class', () => {
    component.isSelected = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tree-item-container').classList).toContain(`selected`);

    component.isSelected = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tree-item-container').classList).not.toContain(`selected`);
  });

  it('should correctly render node name', () => {
    component.node = { name: 'test-node' } as any;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tree-item-container').textContent.trim()).toBe(
      'test-node',
    );
  });

  it('should emit selected on mat list item click', () => {
    component.node = { hasChildren: true } as any;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.tree-item-container').click();
    fixture.detectChanges();
    expect(component.selected).toHaveBeenCalled();
  });

  it('should emit both selected and expanded on node double click', () => {
    component.node = { hasChildren: true } as any;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.tree-item-container').dispatchEvent(new MouseEvent('dblclick'));
    fixture.detectChanges();
    expect(component.selected).toHaveBeenCalled();
    expect(component.expanded).toHaveBeenCalled();
  });
});
