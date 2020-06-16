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
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/UiAutoAccessibleLabelModule.html" data-type="entity-link">UiAutoAccessibleLabelModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiAutoAccessibleLabelModule-5ce626e2836a17fce91e6f3345537022"' : 'data-target="#xs-directives-links-module-UiAutoAccessibleLabelModule-5ce626e2836a17fce91e6f3345537022"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiAutoAccessibleLabelModule-5ce626e2836a17fce91e6f3345537022"' :
                                        'id="xs-directives-links-module-UiAutoAccessibleLabelModule-5ce626e2836a17fce91e6f3345537022"' }>
                                        <li class="link">
                                            <a href="directives/UiAutoAccessibleLabelDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiAutoAccessibleLabelDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiAutofocusModule.html" data-type="entity-link">UiAutofocusModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiAutofocusModule-458e13f7fa25bff1ba64f62ad1c140a1"' : 'data-target="#xs-directives-links-module-UiAutofocusModule-458e13f7fa25bff1ba64f62ad1c140a1"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiAutofocusModule-458e13f7fa25bff1ba64f62ad1c140a1"' :
                                        'id="xs-directives-links-module-UiAutofocusModule-458e13f7fa25bff1ba64f62ad1c140a1"' }>
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
                                        'data-target="#directives-links-module-UiClickOutsideModule-7f2d20698f6ab439b3bdb779b9a9c30e"' : 'data-target="#xs-directives-links-module-UiClickOutsideModule-7f2d20698f6ab439b3bdb779b9a9c30e"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiClickOutsideModule-7f2d20698f6ab439b3bdb779b9a9c30e"' :
                                        'id="xs-directives-links-module-UiClickOutsideModule-7f2d20698f6ab439b3bdb779b9a9c30e"' }>
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
                                        'data-target="#directives-links-module-UiClipboardModule-7931fbb3e3ba4b0a8bf37d86ebec5c58"' : 'data-target="#xs-directives-links-module-UiClipboardModule-7931fbb3e3ba4b0a8bf37d86ebec5c58"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiClipboardModule-7931fbb3e3ba4b0a8bf37d86ebec5c58"' :
                                        'id="xs-directives-links-module-UiClipboardModule-7931fbb3e3ba4b0a8bf37d86ebec5c58"' }>
                                        <li class="link">
                                            <a href="directives/UiClipboardDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiClipboardDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiContentLoaderModule.html" data-type="entity-link">UiContentLoaderModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' : 'data-target="#xs-components-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' :
                                            'id="xs-components-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' }>
                                            <li class="link">
                                                <a href="components/UiContentSpinnerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiContentSpinnerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' : 'data-target="#xs-directives-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' :
                                        'id="xs-directives-links-module-UiContentLoaderModule-a8d653fb11da29d58c71482cc13e324b"' }>
                                        <li class="link">
                                            <a href="directives/UiContentLoaderDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiContentLoaderDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiDateFormatModule.html" data-type="entity-link">UiDateFormatModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiDateFormatModule-6ae273c00ff491a6e230713da8b5ad07"' : 'data-target="#xs-directives-links-module-UiDateFormatModule-6ae273c00ff491a6e230713da8b5ad07"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiDateFormatModule-6ae273c00ff491a6e230713da8b5ad07"' :
                                        'id="xs-directives-links-module-UiDateFormatModule-6ae273c00ff491a6e230713da8b5ad07"' }>
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
                                        'data-target="#directives-links-module-UiDragAndDropModule-be5077b169fec6fc344ac672c8d2db2e"' : 'data-target="#xs-directives-links-module-UiDragAndDropModule-be5077b169fec6fc344ac672c8d2db2e"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiDragAndDropModule-be5077b169fec6fc344ac672c8d2db2e"' :
                                        'id="xs-directives-links-module-UiDragAndDropModule-be5077b169fec6fc344ac672c8d2db2e"' }>
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
                                            'data-target="#components-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' : 'data-target="#xs-components-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' :
                                            'id="xs-components-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' }>
                                            <li class="link">
                                                <a href="components/UiGridComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' : 'data-target="#xs-directives-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' :
                                        'id="xs-directives-links-module-UiGridModule-691183712b26e409e969a346b37c0220"' }>
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
                                            'data-target="#components-links-module-UiGridSearchModule-80f9bf84dcb5b0ece93a4eabe6417634"' : 'data-target="#xs-components-links-module-UiGridSearchModule-80f9bf84dcb5b0ece93a4eabe6417634"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiGridSearchModule-80f9bf84dcb5b0ece93a4eabe6417634"' :
                                            'id="xs-components-links-module-UiGridSearchModule-80f9bf84dcb5b0ece93a4eabe6417634"' }>
                                            <li class="link">
                                                <a href="components/UiGridSearchComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridSearchComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiGridToggleColumnsModule.html" data-type="entity-link">UiGridToggleColumnsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiGridToggleColumnsModule-523b9ab966d6b6162b418d105b4ac04a"' : 'data-target="#xs-components-links-module-UiGridToggleColumnsModule-523b9ab966d6b6162b418d105b4ac04a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiGridToggleColumnsModule-523b9ab966d6b6162b418d105b4ac04a"' :
                                            'id="xs-components-links-module-UiGridToggleColumnsModule-523b9ab966d6b6162b418d105b4ac04a"' }>
                                            <li class="link">
                                                <a href="components/UiGridToggleColumnsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiGridToggleColumnsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiNgLetModule.html" data-type="entity-link">UiNgLetModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiNgLetModule-aefe9609baaf86922c94deff52a48d3b"' : 'data-target="#xs-directives-links-module-UiNgLetModule-aefe9609baaf86922c94deff52a48d3b"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiNgLetModule-aefe9609baaf86922c94deff52a48d3b"' :
                                        'id="xs-directives-links-module-UiNgLetModule-aefe9609baaf86922c94deff52a48d3b"' }>
                                        <li class="link">
                                            <a href="directives/UiNgLetDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiNgLetDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiPasswordIndicatorModule.html" data-type="entity-link">UiPasswordIndicatorModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiPasswordIndicatorModule-8caadba4f3bdb638a98bdcf79a98981c"' : 'data-target="#xs-components-links-module-UiPasswordIndicatorModule-8caadba4f3bdb638a98bdcf79a98981c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiPasswordIndicatorModule-8caadba4f3bdb638a98bdcf79a98981c"' :
                                            'id="xs-components-links-module-UiPasswordIndicatorModule-8caadba4f3bdb638a98bdcf79a98981c"' }>
                                            <li class="link">
                                                <a href="components/UiPasswordIndicatorComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiPasswordIndicatorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiPasswordToggleModule.html" data-type="entity-link">UiPasswordToggleModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiPasswordToggleModule-dee39d231a2286dad6504695c784c499"' : 'data-target="#xs-components-links-module-UiPasswordToggleModule-dee39d231a2286dad6504695c784c499"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiPasswordToggleModule-dee39d231a2286dad6504695c784c499"' :
                                            'id="xs-components-links-module-UiPasswordToggleModule-dee39d231a2286dad6504695c784c499"' }>
                                            <li class="link">
                                                <a href="components/UiPasswordToggleComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiPasswordToggleComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiPipeModule.html" data-type="entity-link">UiPipeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-UiPipeModule-e4ad378a23583d97aa892583e3cd1248"' : 'data-target="#xs-pipes-links-module-UiPipeModule-e4ad378a23583d97aa892583e3cd1248"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-UiPipeModule-e4ad378a23583d97aa892583e3cd1248"' :
                                            'id="xs-pipes-links-module-UiPipeModule-e4ad378a23583d97aa892583e3cd1248"' }>
                                            <li class="link">
                                                <a href="pipes/UiNl2BrPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiNl2BrPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiProgressButtonModule.html" data-type="entity-link">UiProgressButtonModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' : 'data-target="#xs-components-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' :
                                            'id="xs-components-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' }>
                                            <li class="link">
                                                <a href="components/UiButtonProgressBarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiButtonProgressBarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' : 'data-target="#xs-directives-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' :
                                        'id="xs-directives-links-module-UiProgressButtonModule-a99a23afb6056ec69b000f5aff52d662"' }>
                                        <li class="link">
                                            <a href="directives/UiProgressButtonDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiProgressButtonDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiScrollIntoViewModule.html" data-type="entity-link">UiScrollIntoViewModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiScrollIntoViewModule-4b7b3661286fcf5bcff8ffbbb39d1ced"' : 'data-target="#xs-directives-links-module-UiScrollIntoViewModule-4b7b3661286fcf5bcff8ffbbb39d1ced"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiScrollIntoViewModule-4b7b3661286fcf5bcff8ffbbb39d1ced"' :
                                        'id="xs-directives-links-module-UiScrollIntoViewModule-4b7b3661286fcf5bcff8ffbbb39d1ced"' }>
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
                                            'data-target="#components-links-module-UiSecondFormatModule-82451d48547e23e12ae3791458c7e031"' : 'data-target="#xs-components-links-module-UiSecondFormatModule-82451d48547e23e12ae3791458c7e031"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiSecondFormatModule-82451d48547e23e12ae3791458c7e031"' :
                                            'id="xs-components-links-module-UiSecondFormatModule-82451d48547e23e12ae3791458c7e031"' }>
                                            <li class="link">
                                                <a href="components/UiSecondFormatDirective.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiSecondFormatDirective</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiSnackBarModule.html" data-type="entity-link">UiSnackBarModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiSnackBarModule-e74e559889cb6cb793b48c9502d11eae"' : 'data-target="#xs-components-links-module-UiSnackBarModule-e74e559889cb6cb793b48c9502d11eae"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiSnackBarModule-e74e559889cb6cb793b48c9502d11eae"' :
                                            'id="xs-components-links-module-UiSnackBarModule-e74e559889cb6cb793b48c9502d11eae"' }>
                                            <li class="link">
                                                <a href="components/UiSnackBarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiSnackBarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiSpinnerButtonModule.html" data-type="entity-link">UiSpinnerButtonModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' : 'data-target="#xs-components-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' :
                                            'id="xs-components-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' }>
                                            <li class="link">
                                                <a href="components/UiButtonProgressSpinnerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiButtonProgressSpinnerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' : 'data-target="#xs-directives-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' :
                                        'id="xs-directives-links-module-UiSpinnerButtonModule-1149b0d2ac2d3d2dfccc4f7eff863d7e"' }>
                                        <li class="link">
                                            <a href="directives/UiSpinnerButtonDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">UiSpinnerButtonDirective</a>
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
                                        'data-target="#directives-links-module-UiVirtualScrollRangeLoaderModule-968c61eb4ce7818aca03d197da49ef6d"' : 'data-target="#xs-directives-links-module-UiVirtualScrollRangeLoaderModule-968c61eb4ce7818aca03d197da49ef6d"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiVirtualScrollRangeLoaderModule-968c61eb4ce7818aca03d197da49ef6d"' :
                                        'id="xs-directives-links-module-UiVirtualScrollRangeLoaderModule-968c61eb4ce7818aca03d197da49ef6d"' }>
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
                                        'data-target="#directives-links-module-UiVirtualScrollViewportResizeModule-5fb6ee71cee396b27532677f4db1fc14"' : 'data-target="#xs-directives-links-module-UiVirtualScrollViewportResizeModule-5fb6ee71cee396b27532677f4db1fc14"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-UiVirtualScrollViewportResizeModule-5fb6ee71cee396b27532677f4db1fc14"' :
                                        'id="xs-directives-links-module-UiVirtualScrollViewportResizeModule-5fb6ee71cee396b27532677f4db1fc14"' }>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
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
                                <a href="classes/UiMatSnackBarConfig.html" data-type="entity-link">UiMatSnackBarConfig</a>
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
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/QueuedAnnouncer.html" data-type="entity-link">QueuedAnnouncer</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UiPasswordComplexityIntl.html" data-type="entity-link">UiPasswordComplexityIntl</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UiPasswordToggleIntl.html" data-type="entity-link">UiPasswordToggleIntl</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UiSnackbarIntl.html" data-type="entity-link">UiSnackbarIntl</a>
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
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
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
                                <a href="interfaces/IRegexLike.html" data-type="entity-link">IRegexLike</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISecondFormatOptions.html" data-type="entity-link">ISecondFormatOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISelectionDiff.html" data-type="entity-link">ISelectionDiff</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISnackBarAlert.html" data-type="entity-link">ISnackBarAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISnackBarOptions.html" data-type="entity-link">ISnackBarOptions</a>
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
                                <a href="interfaces/IVisibleDiff.html" data-type="entity-link">IVisibleDiff</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IVisibleModel.html" data-type="entity-link">IVisibleModel</a>
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
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
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