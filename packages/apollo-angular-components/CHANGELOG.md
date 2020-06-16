# v9.0.7 (2020-06-16)
* **grid** fix a11y issue on toggle visibility column reset button
* **a11y** add automatic aria-label support

# v9.0.6 (2020-05-14)
* **snackbar** enable configurable plain-text only messages (to help with XSS issues)

# v9.0.5 (2020-04-07)
* **drag-and-drop-file**: add multiple file types support
* **grid**: fix default toggle disabled column
* **suggest**: add support for minimum characters search

# v9.0.4 (2020-03-26)
* **secondformat** fix localization issue

# v9.0.3 (2020-03-25)
* **grid** fix scroll performance when using virtual viewport

# v9.0.2 (2020-03-16)
* **snackbar** show snackbars with 0 delay (that don't auto-close)

# v9.0.1 (2020-02-26)
* upgrade to ng 9.0.3

# v9.0.0 (2020-02-12)
* **grid** add support for toggle-able columns
* upgrade to ng 9

# v0.10.14 (2020-01-22)
* **snackbar** add support for custom template instead of message

# v0.10.15 (2020-01-21)
* **suggest** fix toolip and scrolling
* **suggest** implement fetch strategies
* **password-toggle** implement password toggle for inputs
* **password-indicator** implement a complexity progress indicator

# v0.10.14 (2019-12-06)
* **grid** add `type=button`s to prevent submitting enclosing forms
* **snackbar** add `type=button`s to prevent submitting enclosing forms

# v0.10.13 (2019-10-25)
* **suggest** fix `loading` state on toggle disabled

# v0.10.12 (2019-10-24)
* **suggest** fix `loading` state on toggle disabled

# v0.10.11 (2019-10-24)
* **testing** define `keyCode` and bind correct `code` in generator

# v0.10.10 (2019-10-17)
* **grid** define inline header buttons
* **grid** add ability to toggle filters visibility

# v0.10.9 (2019-10-03)
* **date-format** add resolver support for timezone

# v0.10.8 (2019-09-03)
* **ui-suggest** add support for custom item template and size

# v0.10.7 (2019-08-28)
* **grid** react to ngIf-ed columns
* **drag-and-drop-file** respect multiple=false flag

# v0.10.6 (2019-08-01)
* **ui-suggest** set static spinner strokeWidth

# v0.10.5 (2019-07-31)
* `*uiContentLoading` is a new structural directive that  will will render a progress spinner while the input value is `true` else it will render the content within the container (similar to `*ngIf`)
* **ui-progress-button** fix stroke width
* **ui-progress-button** add fade animation to the button text

# v0.10.4 (2019-07-29)
* [progress-button] implement button augmentor directive, that enables loading state configuration via a progress bar
* [spinner-button] implement button augmentor directive, that enables loading state configuraiton via a spinner

# v0.10.3 (2019-07-17)
* correctly export pipe modules / classes (support AOT builds)

# v0.10.2 (2019-07-17)
* **BREAKING CHANGE** rename `UiSnackbarIntlService` to `UiSnackbarIntl`

# v0.10.1 (2019-07-17)
#### Components

* [snackbar](https://uipath.github.io/angular-components/components/UiSnackBarComponent.html)

#### Services

* [snackbar-service](https://uipath.github.io/angular-components/components/UiSnackBarComponent.html)

#### Directives

* [nl2br](https://uipath.github.io/angular-components/pipes/UiNl2BrPipe.html)

# v0.10.0 (2019-06-13)
* **BREAKING CHANGE** components will no longer be importent directly `@uipath/angular/components`, they will now be imported from their corresponding folder, eg: `@uipath/angular/components/{{NAME}}`
* **BREAKING CHANGE** directives will no longer be importent directly `@uipath/angular/directives`, they will now be imported from their corresponding folder, eg: `@uipath/angular/directives/{{NAME}}`


# v0.9.6 (2019-06-06)
* **NgLet** move embedded view creation in `ctor`, this will allow `ViewChild` queries to be configured with `static: true` strategy

# v0.9.5 (2019-06-05)
* upgrade to `angular@8`
* **UiGrid** complete `visible$` columns BehaviorSubject
* **UiGridFilter** call destroy hook in child classes

# v0.9.3-hotfix1 (2019-06-05)
* **UiGrid** correctly bind to the search `maxlength` attribute

# v0.9.3 (2019-06-02)

### Fixes:

* **UiGridModule** remove barrel definitions for decorated classes (fixes AOT build issues).

# v0.9.2 (2019-06-01)

### Features:

* **EventGenerator** expose the `cursor` utility that injects a cursor image, to help visualize UTs.

# v0.9.1 (2019-06-01)

### First Official Release

#### Components

* [grid](https://uipath.github.io/angular-components/modules/UiGridModule.html)
* [suggest](https://uipath.github.io/angular-components/modules/UiSuggestModule.html)

#### Directives

* [autofocus](https://uipath.github.io/angular-components/modules/UiAutofocusModule.html)
* [click-outside](https://uipath.github.io/angular-components/modules/UiClickOutsideModule.html)
* [clipboard](https://uipath.github.io/angular-components/modules/UiClipboardModule.html)
* [date-format](https://uipath.github.io/angular-components/modules/UiDateFormatModule.html)
* [second-format](https://uipath.github.io/angular-components/modules/UiSecondFormatModule.html)
* [drag-and-drop](https://uipath.github.io/angular-components/modules/UiDragAndDropModule.html)
* [ng-let](https://uipath.github.io/angular-components/modules/UiNgLetModule.html)
* [scroll-into-view](https://uipath.github.io/angular-components/modules/UiScrollIntoViewModule.html)
* [virtual-scroll-range-loader](https://uipath.github.io/angular-components/modules/UiVirtualScrollRangeLoaderModule.html)
* [virtual-scroll-viewport-resize](https://uipath.github.io/angular-components/modules/UiVirtualScrollViewportResizeModule.html)

#### a11y

* [queued-announcer](https://uipath.github.io/angular-components/injectables/QueuedAnnouncer.html)

#### Testing

* [EventGenerator](https://uipath.github.io/angular-components/classes/EventGenerator.html)
* [Key](https://uipath.github.io/angular-components/classes/Key.html)
* [FakeFileList](https://uipath.github.io/angular-components/classes/FakeFileList.html)
