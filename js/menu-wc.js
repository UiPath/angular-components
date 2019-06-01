'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">
                        <img alt="" class="img-responsive" data-type="compodoc-logo" data-src=images/logo.png> 
                    </a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                        <li class="link">
                            <a href="dependencies.html" data-type="chapter-link">
                                <span class="icon ion-ios-list"></span>Dependencies
                            </a>
                        </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse" ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/UiAutofocusModule.html" data-type="entity-link">UiAutofocusModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiAutofocusModule-cef6e6ca764b7bb3138beb83f7dee2e6"' : 'data-target="#xs-directives-links-module-UiAutofocusModule-cef6e6ca764b7bb3138beb83f7dee2e6"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiAutofocusModule-cef6e6ca764b7bb3138beb83f7dee2e6"' :
                                        'id="xs-directives-links-module-UiAutofocusModule-cef6e6ca764b7bb3138beb83f7dee2e6"' }>
                                        <li class="link">
                                            <a href="directives/UiAutofocusDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiAutofocusDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiClickOutsideModule.html" data-type="entity-link">UiClickOutsideModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiClickOutsideModule-ff625b68e02985ccd592116cb19d152f"' : 'data-target="#xs-directives-links-module-UiClickOutsideModule-ff625b68e02985ccd592116cb19d152f"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiClickOutsideModule-ff625b68e02985ccd592116cb19d152f"' :
                                        'id="xs-directives-links-module-UiClickOutsideModule-ff625b68e02985ccd592116cb19d152f"' }>
                                        <li class="link">
                                            <a href="directives/UiClickOutsideDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiClickOutsideDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiClipboardModule.html" data-type="entity-link">UiClipboardModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiClipboardModule-d84c8138d6265e2dcf24b426f5913248"' : 'data-target="#xs-directives-links-module-UiClipboardModule-d84c8138d6265e2dcf24b426f5913248"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiClipboardModule-d84c8138d6265e2dcf24b426f5913248"' :
                                        'id="xs-directives-links-module-UiClipboardModule-d84c8138d6265e2dcf24b426f5913248"' }>
                                        <li class="link">
                                            <a href="directives/UiClipboardDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiClipboardDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiDateFormatModule.html" data-type="entity-link">UiDateFormatModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiDateFormatModule-b515989153428c4b3a4668483ea1a7eb"' : 'data-target="#xs-directives-links-module-UiDateFormatModule-b515989153428c4b3a4668483ea1a7eb"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiDateFormatModule-b515989153428c4b3a4668483ea1a7eb"' :
                                        'id="xs-directives-links-module-UiDateFormatModule-b515989153428c4b3a4668483ea1a7eb"' }>
                                        <li class="link">
                                            <a href="directives/UiDateFormatDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiDateFormatDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiDragAndDropModule.html" data-type="entity-link">UiDragAndDropModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiDragAndDropModule-d0b0ce7c0ffbea3b6de6befe4edee45b"' : 'data-target="#xs-directives-links-module-UiDragAndDropModule-d0b0ce7c0ffbea3b6de6befe4edee45b"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiDragAndDropModule-d0b0ce7c0ffbea3b6de6befe4edee45b"' :
                                        'id="xs-directives-links-module-UiDragAndDropModule-d0b0ce7c0ffbea3b6de6befe4edee45b"' }>
                                        <li class="link">
                                            <a href="directives/UiDragAndDropFileDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiDragAndDropFileDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiGridModule.html" data-type="entity-link">UiGridModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' : 'data-target="#xs-components-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' :
                                            'id="xs-components-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' }>
                                            <li class="link">
                                                <a href="components/UiGridComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' : 'data-target="#xs-directives-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' :
                                        'id="xs-directives-links-module-UiGridModule-1988a49d1836910476f800713ec477d3"' }>
                                        <li class="link">
                                            <a href="directives/UiGridColumnDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridColumnDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridDropdownFilterDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridDropdownFilterDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridExpandedRowDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridExpandedRowDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridFooterDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridFooterDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridHeaderButtonDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridHeaderButtonDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridHeaderDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridHeaderDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridRowActionDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridRowActionDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridRowConfigDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridRowConfigDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UiGridSearchFilterDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridSearchFilterDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiGridSearchModule.html" data-type="entity-link">UiGridSearchModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiGridSearchModule-d3c262ba30afe31f79f67237e0f94f9c"' : 'data-target="#xs-components-links-module-UiGridSearchModule-d3c262ba30afe31f79f67237e0f94f9c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiGridSearchModule-d3c262ba30afe31f79f67237e0f94f9c"' :
                                            'id="xs-components-links-module-UiGridSearchModule-d3c262ba30afe31f79f67237e0f94f9c"' }>
                                            <li class="link">
                                                <a href="components/UiGridSearchComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridSearchComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiNgLetModule.html" data-type="entity-link">UiNgLetModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiNgLetModule-90399582a5aefb872067589b9189d28e"' : 'data-target="#xs-directives-links-module-UiNgLetModule-90399582a5aefb872067589b9189d28e"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiNgLetModule-90399582a5aefb872067589b9189d28e"' :
                                        'id="xs-directives-links-module-UiNgLetModule-90399582a5aefb872067589b9189d28e"' }>
                                        <li class="link">
                                            <a href="directives/UiNgLetDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiNgLetDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiScrollIntoViewModule.html" data-type="entity-link">UiScrollIntoViewModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiScrollIntoViewModule-319209c821797d442df14feb01839367"' : 'data-target="#xs-directives-links-module-UiScrollIntoViewModule-319209c821797d442df14feb01839367"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiScrollIntoViewModule-319209c821797d442df14feb01839367"' :
                                        'id="xs-directives-links-module-UiScrollIntoViewModule-319209c821797d442df14feb01839367"' }>
                                        <li class="link">
                                            <a href="directives/UiScrollIntoViewDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiScrollIntoViewDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiSecondFormatModule.html" data-type="entity-link">UiSecondFormatModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiSecondFormatModule-6b649721efc4b1b646faf7c6305c8900"' : 'data-target="#xs-directives-links-module-UiSecondFormatModule-6b649721efc4b1b646faf7c6305c8900"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiSecondFormatModule-6b649721efc4b1b646faf7c6305c8900"' :
                                        'id="xs-directives-links-module-UiSecondFormatModule-6b649721efc4b1b646faf7c6305c8900"' }>
                                        <li class="link">
                                            <a href="directives/UiSecondFormatDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiSecondFormatDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiSuggestModule.html" data-type="entity-link">UiSuggestModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/UiVirtualScrollRangeLoaderModule.html" data-type="entity-link">UiVirtualScrollRangeLoaderModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiVirtualScrollRangeLoaderModule-0d45aa895e08148d034e5b7463a78724"' : 'data-target="#xs-directives-links-module-UiVirtualScrollRangeLoaderModule-0d45aa895e08148d034e5b7463a78724"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiVirtualScrollRangeLoaderModule-0d45aa895e08148d034e5b7463a78724"' :
                                        'id="xs-directives-links-module-UiVirtualScrollRangeLoaderModule-0d45aa895e08148d034e5b7463a78724"' }>
                                        <li class="link">
                                            <a href="directives/UiVirtualScrollRangeLoaderDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiVirtualScrollRangeLoaderDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiVirtualScrollViewportResizeModule.html" data-type="entity-link">UiVirtualScrollViewportResizeModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiVirtualScrollViewportResizeModule-cb300a230b3a26b4e013b958272d07c1"' : 'data-target="#xs-directives-links-module-UiVirtualScrollViewportResizeModule-cb300a230b3a26b4e013b958272d07c1"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiVirtualScrollViewportResizeModule-cb300a230b3a26b4e013b958272d07c1"' :
                                        'id="xs-directives-links-module-UiVirtualScrollViewportResizeModule-cb300a230b3a26b4e013b958272d07c1"' }>
                                        <li class="link">
                                            <a href="directives/UiVirtualScrollViewportResizeDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiVirtualScrollViewportResizeDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#directives-links"' :
                                'data-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse" ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/UiGridColumnDirective.html" data-type="entity-link">UiGridColumnDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridDropdownFilterDirective.html" data-type="entity-link">UiGridDropdownFilterDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridExpandedRowDirective.html" data-type="entity-link">UiGridExpandedRowDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridFooterDirective.html" data-type="entity-link">UiGridFooterDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridHeaderButtonDirective.html" data-type="entity-link">UiGridHeaderButtonDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridHeaderDirective.html" data-type="entity-link">UiGridHeaderDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridRowActionDirective.html" data-type="entity-link">UiGridRowActionDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridRowConfigDirective.html" data-type="entity-link">UiGridRowConfigDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/UiGridSearchFilterDirective.html" data-type="entity-link">UiGridSearchFilterDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/EventGenerator.html" data-type="entity-link">EventGenerator</a>
                            </li>
                            <li class="link">
                                <a href="classes/FakeFileList.html" data-type="entity-link">FakeFileList</a>
                            </li>
                            <li class="link">
                                <a href="classes/Key.html" data-type="entity-link">Key</a>
                            </li>
                            <li class="link">
                                <a href="classes/UiGridIntl.html" data-type="entity-link">UiGridIntl</a>
                            </li>
                            <li class="link">
                                <a href="classes/UiSuggestMatFormField.html" data-type="entity-link">UiSuggestMatFormField</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/QueuedAnnouncer.html" data-type="entity-link">QueuedAnnouncer</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UiSuggestIntl.html" data-type="entity-link">UiSuggestIntl</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IDateFormatOptions.html" data-type="entity-link">IDateFormatOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDropdownOption.html" data-type="entity-link">IDropdownOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDropEvent.html" data-type="entity-link">IDropEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFilterModel.html" data-type="entity-link">IFilterModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IGridDataEntry.html" data-type="entity-link">IGridDataEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IKey.html" data-type="entity-link">IKey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IKeyModifier.html" data-type="entity-link">IKeyModifier</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISecondFormatOptions.html" data-type="entity-link">ISecondFormatOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISelectionDiff.html" data-type="entity-link">ISelectionDiff</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISortModel.html" data-type="entity-link">ISortModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISuggestValue.html" data-type="entity-link">ISuggestValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISuggestValueData.html" data-type="entity-link">ISuggestValueData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISuggestValues.html" data-type="entity-link">ISuggestValues</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VirtualScrollItem.html" data-type="entity-link">VirtualScrollItem</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});