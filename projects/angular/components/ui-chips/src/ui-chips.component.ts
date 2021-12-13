import {
  UiAutocomopleteDataSource,
} from 'projects/angular/components/ui-chips/src/ui-autocomplete/ui-autocomplete-datasource.directive';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';

import { ListRange } from '@angular/cdk/collections';
import {
  COMMA,
  ENTER,
} from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import {
  ISuggestValue,
  ISuggestValueData,
  SearchSourceFactory,
} from './models';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  selector: 'ui-chips',
  templateUrl: './ui-chips.component.html',
  styleUrls: ['./ui-chips.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiChipsComponent<T> implements AfterViewInit {

  //   get viewportMaxHeight() {
  //     const actualCount = Math.max(this.renderItems.filter(Boolean).length + Number(this.isCustomValueVisible), 1);
  //     const displayedCount = Math.min(this.displayCount, actualCount);

  //     return this.itemSize * displayedCount;
  // }

  @Input()
  searchSourceFactory!: SearchSourceFactory<T>;

  @Input()
  removable = true;

  itemSize = 32;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  chipListControl = new FormControl();
  // eslint-disable-next-line rxjs/finnish
  filteredOptions: Observable<ISuggestValueData<T>[]>;
  selectedOptions: ISuggestValueData<T>[] = [];
  allFruits: ISuggestValueData<T>[] = [];

  @ViewChild('fruitInput')
  fruitInput!: ElementRef<HTMLInputElement>;

  ds?: UiAutocomopleteDataSource<T>;

  inputStream$: Observable<string>;

  constructor(
    // private _cd: ChangeDetectorRef,
  ) {
    this.filteredOptions = this.fruitCtrl.valueChanges.pipe(
      filter((searchTerm: string) => Boolean(searchTerm)),
      switchMap((searchTerm: string) => this.searchSourceFactory(searchTerm, 10, 0)),
      map(results => results.data ?? []),
    );

    this.inputStream$ = this.fruitCtrl.valueChanges.pipe(
      startWith(''),
      filter(Boolean),
    );
  }

  ngAfterViewInit(): void {
    this.ds = new UiAutocomopleteDataSource<T>(this.searchSourceFactory, this.inputStream$);
  }

  trackById = (_: number, { id }: ISuggestValue) => id;

  selected(evt: MatAutocompleteSelectedEvent) {
    const option: ISuggestValueData<T> = evt.option.value;
    this.selectedOptions.push(option);

    // Chip's input will not work with setvalue and must be set manually
    // Github issue: https://github.com/angular/components/issues/10968
    this.fruitInput.nativeElement.value = '';
  }

  rangeLoad(_evt: ListRange) {
    console.log(_evt);
  }

  // add(event: MatChipInputEvent): void {
  //   const value = (event.value || '').trim();

  //   // Add our fruit
  //   // if (value) {
  //   //   this.fruits.push(value);
  //   // }

  //   // // Clear the input value
  //   // event.chipInput!.clear();

  //   // this.fruitCtrl.setValue(null);
  // }

  // remove(fruit: string): void {
  //   const index = this.fruits.indexOf(fruit);

  //   if (index >= 0) {
  //     this.fruits.splice(index, 1);
  //   }
  // }
}
