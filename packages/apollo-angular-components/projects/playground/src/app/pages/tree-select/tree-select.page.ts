import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
 ITreeNode, UiTreeSelectComponent,
} from '@uipath/angular/components/ui-tree-select';
import { UiSpinnerButtonModule } from '@uipath/angular/directives/ui-spinner-button';
import { of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    UiTreeSelectComponent,
    MatFormFieldModule,
    MatIconModule,
    UiSpinnerButtonModule,
    MatButtonModule,
  ],
  selector: 'ui-app-tree-select',
  templateUrl: './tree-select.page.html',
  styleUrls: ['./tree-select.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TreeSelectPageComponent {
  data$ = of(treeData);

  initialSelection = [treeData[1].key, treeData[1].children![1]!.key, treeData[1].children![1]!.children![0]!.key ];

  selectedNode = '';
  constructor(private _cd: ChangeDetectorRef) { }

  selected(data: ITreeNode[]) {
    this.selectedNode = JSON.stringify(data, null, 4);
  }

  expanded(data: ITreeNode) {
    console.log('received expanded event', data);
    // NOTE: playground logic partially broken, feel free to change if you want to test something
    setTimeout(() => {
      const x = treeData.map(n => {
        if (n.key === data.key) {
          n.children = [...n.children ?? [], ...getLevel(data!.name)];
        }
        return n;
      });
      this.data$ = of([...x]);
      this._cd.detectChanges();
    }, 1500);

  }

  get numCdkTreeNodes() {
    return document.querySelectorAll('.node').length;
  }

  totalDataCount(items: ITreeNode[]): any {
    return items.length
      ? items
        .map(item => this.totalDataCount(item.children ?? []))
        .reduce((v, ac) => v + ac, 0)
      : 1;
  }
}

const treeData: ITreeNode[] = [
  {
    name: 'Folder A',
  },
  {
    name: 'Folder B',
    children: [
      {
        key: uuidv4(),
        name: 'Folder B-1',
      },
      {
        key: uuidv4(),
        name: 'Folder B-2',
        children: [
          {
            key: uuidv4(),
            name: 'Folder B-2-1',
          },
        ],
      },
    ],
  },
  {
    name: 'Folder C',
    children: [],
  },
  {
    name: 'Folder D',
  },
  {
    name: 'Folder E',
  },
  {
    name: 'Folder F',
  },
  {
    name: 'Folder G',
    children: [],
  },
  {
    name: 'Folder H',
    children: [],
  },
  {
    name: 'Folder I',
  },
  {
    name: 'Folder J',
    children: [],
  },
].map((f: any) => ({
  name: f.name,
  children: f.children,
  key: uuidv4(),
}));

const getLevel = (parentFolderName: string) => ['A', 'B', 'C', 'D', 'E'].map(l => ({
  name: `${parentFolderName}-${l}`,
  key: uuidv4(),
}));
