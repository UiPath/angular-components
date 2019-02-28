import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';

import { isInternetExplorer } from 'projects/angular-components/src/lib/utilities';

@Directive({
  selector: '[uiDragAndDropFile]',
})
export class UiDragAndDropFileDirective
  implements 
  AfterViewInit,
  OnDestroy {

  @Input()
  public fileType: string;

  @Input()
  public fileBrowseRef: Element;

  @Input()
  public fileClearRef: Element;

  @Input()
  public multiple = false;

  @Output()
  public fileChange = new EventEmitter<File[]>();

  @Output()
  public fileClear = new EventEmitter();

  @HostBinding('class.file-dragging')
  protected _isDragging = false;

  private _disposalCallbacks: Array<() => void> = [];
  private _fileInput: HTMLInputElement;

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
  ) {
    this._fileInput = this._renderer.createElement('input') as HTMLInputElement;
    this._renderer.setProperty(this._fileInput, 'type', 'file');
    this._renderer.setProperty(this._fileInput, 'value', null);
    this._renderer.setAttribute(this._fileInput, 'hidden', '');
    this._renderer.appendChild(this._elementRef.nativeElement, this._fileInput);
  }

  ngAfterViewInit() {
    if (this.multiple) {
      this._renderer.setProperty(this._fileInput, 'multiple', 'true');
    }

    this._preventEnterOnChildren(this._elementRef.nativeElement);

    this._renderer.setProperty(this._fileInput, 'accept', this.fileType);

    if (!this.fileBrowseRef) {
      this.fileBrowseRef = this._elementRef.nativeElement;
    }

    this._renderer.setStyle(this.fileBrowseRef, 'cursor', 'pointer');
    const browse = this._renderer
      .listen(this.fileBrowseRef, 'click', () => this._fileInput.click());
    this._disposalCallbacks.push(browse);

    const change = this._renderer.listen(this._fileInput, 'change', (ev) => {
      this._preventAll(ev);
      const target = ev.target as HTMLInputElement;
      this._emitFiles(target.files);
      this._renderer.setProperty(this._fileInput, 'value', null);
    });
    this._disposalCallbacks.push(change);

    if (this.fileClearRef) {
      const clear = this._renderer
        .listen(this.fileClearRef, 'click', () => {
          this._renderer.setProperty(this._fileInput, 'value', null);
          this.fileClear.emit();
        });
      this._disposalCallbacks.push(clear);
    }
  }

  ngOnDestroy() {
    this._disposalCallbacks.forEach(dispose => {
      dispose();
    });
  }

  @HostListener('drop', ['$event'])
  protected onDrop(ev: DragEvent) {
    this._preventAll(ev);
    this._isDragging = false;
    this._emitFiles(ev.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  protected onDragOver(ev: DragEvent) {
    this._preventAll(ev);
    this._isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  protected onDragLeave(ev: DragEvent) {
    this._preventAll(ev);
    this._isDragging = false;
  }

  @HostListener('dragend')
  protected onDragEnd() {
    this._isDragging = false;
  }

  @HostListener('dragenter', ['$event'])
  protected onDragEnter(ev: DragEvent) {
    this._preventAll(ev);
  }

  private _emitFiles(files: FileList) {
    if (
      !files ||
      !files.length
    ) { return; }

    const emittedFiles = Array.from(files).filter(file =>
      !this.fileType ||
      file.name.endsWith(this.fileType),
    );

    if (!emittedFiles.length) { return; }

    this.fileChange.emit(emittedFiles);
  }

  private _preventEnterOnChildren(element: Element) {
    if (!isInternetExplorer()) { return; }

    if (!!element.children.length) {
      const children: Element[] = Array.from(element.children);

      for (const child of children) {
        const dragenter = this._renderer.listen(child, 'dragenter', this._preventAll);
        const dragleave = this._renderer.listen(child, 'dragleave', this._preventAll);

        this._disposalCallbacks.push(
          dragenter,
          dragleave,
        );
      }
    }
  }

  private _preventAll(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
