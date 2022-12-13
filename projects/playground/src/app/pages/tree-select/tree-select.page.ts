import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ITreeNode } from '@uipath/angular/components/ui-tree-select';
import { uniqueId } from 'lodash-es';

@Component({
  selector: 'ui-app-tree-select',
  templateUrl: './tree-select.page.html',
  styleUrls: ['./tree-select.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TreeSelectPageComponent {
  data = treeData;

  selectedNode = '';
  constructor(private _cd: ChangeDetectorRef) { }

  selected(data: ITreeNode[]) {
    this.selectedNode = JSON.stringify(data, null, 4);
  }

  expanded(data: ITreeNode) {
    setTimeout(() => {
      const x = this.data.map(n => {
        if (n.key === data.key) {
          n.children = [...getLevel(data!.name)];
        }
        return n;
      });
      this.data = [...x];
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
    children: [],
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
  key: uniqueId(),
}));

const getLevel = (parentFolderName: string) => ['A', 'B', 'C', 'D', 'E'].map(l => ({
  name: `${parentFolderName}-${l}`,
  key: uniqueId(),
}));
