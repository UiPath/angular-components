export const JASMINE_STYLES = `
    html, body {
        background-color: #222;
        color: #aaa;
    }

    .jasmine_html-reporter {
        background-color: transparent!important;
    }

    .jasmine-stack-trace,
    .jasmine-bar.jasmine-menu,
    .jasmine-spec-list-menu {
        border: none!important;
        background-color: #333!important;
        color: #efefef!important;
    }

    .jasmine-result-message {
        color: #efefef!important;
    }

    li.jasmine-passed a,
    li.jasmine-passed:before {
        color: #66bb6a!important;
    }

    .jasmine-spec-detail.jasmine-failed,
    .jasmine-overall-result.jasmine-failed {
        border-top: 2px solid #222!important;
        border-bottom: 2px solid #222!important;
        background-color: #ca3a11!important;
    }

    .jasmine-bar.jasmine-skipped {
        background-color: #333!important;
    }

    .jasmine-bar.jasmine-incomplete {
        background-color: #666!important;
    }

    .jamine-passed {
        background-color: #250;
    }

    .jasmine-failed {
        background-color: #900;
    }

    .jasmine-symbol-summary li.jasmine-failed {
        background-color: transparent!important;
    }

    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(10, 10, 10, .3);
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(10, 10, 10, .6);
    }

    ::-webkit-scrollbar:hover {
        background: rgba(10, 10, 10, .44);
    }
`;
