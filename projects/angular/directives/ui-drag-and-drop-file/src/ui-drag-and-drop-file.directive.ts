import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    Renderer2,
    SimpleChanges,
} from '@angular/core';
import { isInternetExplorer } from '@uipath/angular/utilities';

/**
 * A directive that facilitates `file inputs` and `file drop regions`.
 *
 * @export
 */
@Directive({
    selector: '[uiDragAndDropFile]',
})
export class UiDragAndDropFileDirective implements OnChanges, AfterViewInit, OnDestroy {
  /**
   * The accepted `file-type`.
   *
   */
  @Input()
    public fileType?: string;

  /**
   * The element reference that triggers file `browsing`.
   *
   */
  @Input()
  public fileBrowseRef?: Element;

  /**
   * The element reference that serve as a `clear` trigger for the selected files.
   *
   */
  @Input()
  public fileClearRef?: Element;

  /**
   * Configures if the `file area` accepts multiple files.
   *
   */
  @Input()
  public multiple = false;

  /**
   * Configures the `disabled` state of the `file area`.
   *
   */
  @Input()
  public disabled = false;

  /**
   * An event that emits when the file selection state `changes`.
   *
   */
  @Output()
  public fileChange = new EventEmitter<File[]>();

  /**
   * An event that emits when the file selection is `cleared`.
   *
   */
  @Output()
  public fileClear = new EventEmitter();

  @HostBinding('class.file-dragging')
  protected _isDragging = false;

  private _disposalCallbacks: Array<() => void> = [];
  private _fileInput: HTMLInputElement;

  /**
    * @ignore
    */
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

  /**
   * @ignore
   */
  ngOnChanges(changes: SimpleChanges) {
      if (changes.fileType) {
          const fileType = changes.fileType.currentValue;
          this._renderer.setProperty(this._fileInput, 'accept', fileType || '');
      }
  }

  /**
    * @ignore
    */
  ngAfterViewInit() {
      if (this.multiple) {
          this._renderer.setProperty(this._fileInput, 'multiple', 'true');
      }

      this._preventEnterOnChildren(this._elementRef.nativeElement);

      if (!this.fileBrowseRef) {
          this.fileBrowseRef = this._elementRef.nativeElement;
      }

      this._renderer.setStyle(this.fileBrowseRef, 'cursor', 'pointer');

      const browse = this._renderer
          .listen(this.fileBrowseRef, 'click', () => {
              if (this.disabled) { return; }
              this._fileInput.click();
          });
      this._disposalCallbacks.push(browse);

      const change = this._renderer.listen(this._fileInput, 'change', (ev) => {
          this._preventAll(ev);
          if (this.disabled) { return; }
          const target = ev.target as HTMLInputElement;
          if (target.files) {
              this._emitFiles(target.files);
              this._renderer.setProperty(this._fileInput, 'value', null);
          }
      });
      this._disposalCallbacks.push(change);

      if (this.fileClearRef) {
          const clear = this._renderer
              .listen(this.fileClearRef, 'click', () => {
                  if (this.disabled) { return; }
                  this._renderer.setProperty(this._fileInput, 'value', null);
                  this.fileClear.emit();
              });
          this._disposalCallbacks.push(clear);
      }
  }

  /**
    * @ignore
    */
  ngOnDestroy() {
      this._disposalCallbacks.forEach(dispose => {
          dispose();
      });
  }

  /**
   * Reacts to `drop` events.
   *
   * @param ev The `DragEvent` data associated to the `drop`.
   */
  @HostListener('drop', ['$event'])
  protected _onDrop(ev: DragEvent) {
      this._preventAll(ev);
      if (this.disabled) { return; }
      this._isDragging = false;
      this._emitFiles(ev.dataTransfer!.files);
  }

  /**
   * Marks the `state` as `dragging` when a `dragover` event occurs.
   *
   * @param ev The `DragEvent` data associated to the `dragover`.
   */
  @HostListener('dragover', ['$event'])
  protected _onDragOver(ev: DragEvent) {
      this._preventAll(ev);
    if (
      this.disabled ||
      !this.multiple &&
      ev.dataTransfer &&
      ev.dataTransfer.items &&
      ev.dataTransfer.items.length > 1
    ) { return; }
      this._isDragging = true;
  }

  /**
   * Clears the `dragging` `state` when a `dragleave` event occurs.
   *
   * @param ev The `DragEvent` data associated to the `dragover`.
   */
  @HostListener('dragleave', ['$event'])
  protected _onDragLeave(ev: DragEvent) {
      this._preventAll(ev);
      if (this.disabled) { return; }
      this._isDragging = false;
  }

  /**
   * Clears the `dragging` `state` when a `dragleave` event occurs.
   *
   * @param ev The `DragEvent` data associated to the `dragend`.
   */
  @HostListener('dragend')
  protected _onDragEnd() {
      if (this.disabled) { return; }
      this._isDragging = false;
  }

  /**
   * Prevents weird flickering `cross-browser`.
   *
   * @param ev The `DragEvent` data associated to the `dragenter`.
   */
  @HostListener('dragenter', ['$event'])
  protected _onDragEnter(ev: DragEvent) {
      this._preventAll(ev);
      if (this.disabled) { return; }
  }

  private _emitFiles(files: FileList) {
      if (
          !files ||
      !files.length ||
      this.disabled
      ) { return; }

      const acceptedExtensions = (this.fileType ?? '')
          .split(',')
          .map(e => e.trim().toLowerCase());
      const isAccepted = (file: File) => this.fileType
          ? acceptedExtensions.some(extension => file.name.toLowerCase().endsWith(extension))
          : true;
      const emittedFiles = Array.from(files).filter(isAccepted);

    if (
      !emittedFiles.length ||
      emittedFiles.length > 1 && !this.multiple
    ) { return; }

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
