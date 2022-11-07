# v13.10.0 (2022-11-07)
* **grid** add support for multiple selection suggest filter
* **deps** bump follow-redirects from 1.14.7 to 1.15.2
* **deps** bump trim-newlines and @commitlint/cli
* **deps** bump minimist and commitizen
* **deps** bump async from 2.6.3 to 2.6.4
* **deps** bump moment from 2.29.1 to 2.29.4
* **deps** bump terser and @angular-devkit/build-angular
* **deps** bump ansi-regex
* **chore** bump minor version

# v13.9.0 (2022-11-01)
* **suggest** add disabled flag to ISuggestValue
* **suggest** add displayValueFactory input
* **chore** bump minor version

# v13.8.0 (2022-10-04)
* **grid** multiple expanded rows

# v13.7.2 (2022-09-21)
* **dateformat** run detectChanges only if date input value changes

# v13.7.1 (2022-09-07)
* **grid** add column input used for sorting

# v13.7.0 (2022-09-01)
* **suggest** flag unsupported minChars & enableCustomValue combo
* **suggest** same label name triggers the add option
* **suggest** suggestion list size is too small

# v13.6.8 (2022-08-26)
* **grid** set indeterminate to true if not all rows are selected
* **grid** unselect header checkbox if selection manager has no value

# v13.6.7 (2022-08-18)
* **dateformat** trigger change detection on setting input

# v13.6.6 (2022-08-12)
* **grid** hide expanded filters on row selection
* **grid** hide custom filter btn on row selection

# v13.6.5 (2022-08-11)
* **dateformat** add injection token properties
* **grid** hide expanded filters if grid has custom filter

# v13.6.4 (2022-08-09)
* **chore** bump patch version

# v13.6.3 (2022-08-09)
* **suggest** do not clear the search input on selecting an item

# v13.6.2 (2022-08-08)
* **suggest** remove extra space

# v13.6.1 (2022-08-04)
* **grid** add column description icon
* **grid** expose default filter values
* **grid** add toggle columns divider

# v13.6.0 (2022-07-28)
* **fix** fix the return value of valueSummary func
* **refactor** extract valueSummary func
* **chore** add unit tests
* **suggest** add compact summary support

# v13.5.0 (2022-07-21)
* **deps** add dom iterable in tsconfig
* **grid** add tests for custom filter
* **playground** add custom filter input
* **grid** add input for custom filter value
* **playground** convert filter value to string

# v13.4.1 (2022-06-22)
* **suggest** hide no results when header items are available

# v13.4.0 (2022-06-09)
* **suggest** implement custom header slot

# v13.3.3 (2022-05-13)
* **grid** update tests for page index reset
* **grid** do not reset page index for same search value
* **grid** set page index in tests

# v13.3.2 (2022-05-12)
* **grid** set first page when page index exists

# v13.3.1 (2022-05-11)
* **grid** set proper import path

# v13.3.0 (2022-05-11)
* **grid** add tests
* **grid** add keyboard column resize
* **suggest** add auto-accessible-label module
* **grid** add test
* **grid** reset page after search
* **grid** update header elements rendering order

# v13.2.3 (2022-04-26)
* **grid** update header elements rendering order

# v13.2.2 (2022-03-17)
* **grid** change column icon and divider height
* **suggest** results remove italics

# v13.2.1 (2022-03-04)
* **chore** karma bump
* **suggest** add tests
* **suggest** refocus post item selection
* **suggest** on multiple always clear input
* **suggest** push custom item only on single select

# v13.2.0 (2022-02-23)
* **suggest** add input for removable chips

# v13.1.0 (2022-02-22)
* **grid** add test cases for empty filter state
* **grid** add filters empty state input
* **suggest** add missing theme class
* **suggest** add tooltip & ellipsis to chips

# v13.0.1 (2022-02-22)
* **suggest** prevent chip remove on multiselect & readonly
* **suggest** update tests

# v13.0.0 (2022-02-08)
* **chore** npm audit
* **chore** bump angular version
* **suggest** persist drilldown selected value

# v13.0.0-rc.13 (2022-01-31)
* **suggest** expose input to allow fetching while closed consumers may use this to reset/refetch items even if closed in order to trigger validations

# v13.0.0-rc.11 (2022-01-27)
* **suggest** add multiple custom value support
* **chore** change playground port

# v13.0.0-rc.10 (2022-01-20)
* **chore** add playground scenario
* **grid** drill down filter
* **chore** enable strictTemplates
* **suggest** trim value for search calls
* **chore** ng update
* **suggest** add support for drill-down
* **chore** disable flaky test

# v13.0.0-rc.9 (2022-01-19)
* **suggest** do NOT select on space in multiple
* **suggest** repair test

# v13.0.0-rc.8 (2022-01-17)
* **suggest** repair placeholder rendering show defaultValue in matChips placeholder if any on empty

# v13.0.0-rc.7 (2022-01-14)
* **suggest** update placeholder rendering logic
* **suggest** adjust mat chip styles

# v13.0.0-rc.6 (2022-01-13)
* **fix** update import path

# v13.0.0-rc.5 (2022-01-13)
* **test** update existing tests & add a11y suite
* **suggest** add aria label attribute
* **suggest** prevent autofocus on render

# v13.0.0-rc.4 (2022-01-12)
* **fix** moment import

# v13.0.0-rc.3 (2022-01-12)
* **chore** update peer deps
* **test** update multi-select scenarios
* **suggest** render multi-select suggest as chips
* **feat** playground suggest page
* **feat** run playground on port 4300

# v13.0.0-rc.2 (2022-01-12)
* **fix** adjust imports for moment
* **chore** update settings colors for peacock

# v13.0.0-rc.1 (2022-01-11)
* **fix** angular ivy bug
* **chore** update dependencies
* **feat** snackbar support for extra css class
* **build** update publish tasks to work with npm v7
* **snackbar** add component support
* **build** `npm ci` should work
* **ng-let** improve typings

# v13.0.0-rc.0 (2021-12-07)
* **fix** update test setup
* **fix** theme build
* **fix** apply new linting rules
* **fix** update eslint rules
* **fix** update public api exports
* **fix** drop public modifier
* **chore** bump eslint plugins
* **chore** bump angular material
* **chore** upgrade angular core & cli

# v12.5.6 (2021-11-05)
* **grid** expose resize stream

# v12.5.5 (2021-11-03)
* **playground** add visibility columns state
* **grid** emit toggle visibility columns

# v12.5.4 (2021-11-02)
* **matformfield-required** error when label is not existing

# v12.5.3 (2021-11-01)
* **grid** persist search icon

# v12.5.2 (2021-10-29)
* **grid** align footer icons
* **grid** position search-icon on the left
* **grid** outline column icon

# v12.5.1 (2021-10-29)
* **matformfield-required** mark intl as optional

# v12.5.0 (2021-10-27)
* **matformfield-required** test the directive
* **matformfield-required** create directive that adds tooltip

# v12.4.0 (2021-09-21)
* **suggest** render a searchable info message
* **suggest** add custom item template for value
* **chore** enable bracketPairColorization

# v12.3.0 (2021-09-17)
* **grid** add tooltip for columns and filters

# v12.2.0 (2021-09-09)
* **chore** bump angular to 12.2.5
* **chore** add vscode theming colors
* **suggest** range loader emit issues
* **deps** bump tar from 4.4.8 to 4.4.15

# v12.1.0 (2021-07-15)
* **chore** bump angular to 12.1.2
* **grid** disable selection by row data

# v12.0.0 (2021-07-13)

# v12.0.0-rc.3 (2021-06-18)

* **chore** drop public member
* **BREAKING CHANGE** grid place toggle columns between search and filters add divider between toggle and filters
* **grid** adjust spacing in no results message
* **chore** bind typescript version to workspace
* **chore** fix lint issues
* **chore** auto format
* **chore** ng lint --fix
* **chore** migrate to eslint
* **BREAKING CHANGE** grid change default design, previous is now legacy
* **chore** bump dependencies
* **chore** npm audit fix
* **chore** ng update
* **playground** update for collapseFiltersCount
* **grid** expose collapseFiltersCount
* **dateformat** default options
* **grid** 'eager' | 'onOpen'

# v12.0.0-rc.2 (2021-05-31)
* **a11y** add basic a11y test cases
* **a11y** setup testing for a11y
* **a11y** add jasmine to project

# v12.0.0-rc.1 (2021-05-19)
* **fix** tmp fix for scroll viewport test

# v12.0.0-rc.0 (2021-05-14)
* **chore** bump rx to 7.0.1
* **chore** bump angular material to 12
* **chore** bump angular to 12

# v11.0.1 (2021-04-28)
* **snackbar** correctly map icons to type & playground
* **fix** add fix changelog script if merge issues
* **chore** add autoamtic changelog & version bump & tag
* **grid** add type="button" to filter button
* **chore** add missing env refferences
* **chore** add .npmrc for publishing to github
* **deps** bump ini from 1.3.5 to 1.3.8

# v11.0.0 (2021-04-13)

# v11.0.0-rc.7 (2021-04-08)
* **grid** style updates for alternate design
* **grid** expose data attribute for column property
* **suggest** expose data attribute for each rendered element

# v11.0.0-rc.6 (2021-03-31)
* **grid** fix hasValue stream

# v11.0.0-rc.5 (2021-03-30)
* **password-indicator**  implement proper a11y support
* **a11y** add mat-icon[tabindex] to auto-accessible-label directive
* **testing**  allow multiple modifiers on key up & down
* **drag-and-drop-file** add keyboard usability to drag & drop
* **grid** add row headers for a11y
* **grid** announce header actions on selection

# v11.0.0-rc.4 (2021-03-12)
* **BREAKING CHANGE** grid remove cdk experimental, add rowSize
* **grid** update no content template

# v11.0.0-rc.3 (2021-03-10)
* **grid** collapsible filters when disabled/not visible
* **grid** render multi page selection above grid for alternate design
* **grid** enable support for multiple main actions
* **grid** column filter redesign
* **grid** collapsible filters
* **grid** add directives for custom no-data and loading states
* **grid** apollo footer redesign
* **snackbar** add action support to `show` method
* **chore** ng update
* **chore** fix formatting issues due to import sort order

# v11.0.0-rc.2 (2020-11-25)
* **BREAKING CHANGE** grid no longer uses cache for IE by default

# v11.0.0-rc.1 (2020-11-12)
* **BREAKING CHANGE** Upgrade to Angular 11
* **snackbar** expose action button

# v10.0.0 (2020-11-12)

# v10.0.0-rc.3 (2020-11-05)
* **ng** update to `10.2`
* **rxjs** version bump
* **chore** update peerDependencies
* **chore** update import types

# v10.0.0-rc.2 (2020-10-28)
* **grid** differentiate between user sort and programmatic sort events
* **grid** a11y: announce only user `sort` events
* **grid** a11y: expose translateable aria-label for checkboxes
* **grid** added `matTooltip` for checkboxes
* **suggest** a11y: fixes to title, specify `role` attributes for list
* **suggest** a11y: announce current `option` on open
* **suggest** announce "no results" msg if empty

# v10.0.0-rc.1 (2020-10-15)
* **grid** fix multiple row selection with shift

# v10.0.0-rc.0 (2020-10-01)
* **BREAKING CHANGE** Upgrade to Angular 10
* **extensions** define recommended extensions.json
* **virtual-scroll-range-loader** prevent range emit when raw is range is empty or touched

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
