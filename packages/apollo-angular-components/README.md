<img src="https://raw.githubusercontent.com/UiPath/angular-components/master/logo.png" width="135" />

# Angular Components Library

A great set of reusable `@angular` components, directives and testing utilities.

One of our main goals is to allow easy integration with the great collection of components already provided by the `@angular/material` team and to build everything with the following in mind:

- 🤘 a11y
- 🚀 performance
- 💖 look and feel

[![npm](https://img.shields.io/npm/v/@uipath/angular.svg)](https://www.npmjs.com/package/@uipath/angular)
[![Build Status](https://uipath.visualstudio.com/angular-components/_apis/build/status/UiPath.angular-components?branchName=master)](https://uipath.visualstudio.com/angular-components/_build/latest?definitionId=387&branchName=master)
[![Test Coverage](https://api.codeclimate.com/v1/badges/61117dc99c96535bbfb2/test_coverage)](https://codeclimate.com/github/UiPath/angular-components/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/61117dc99c96535bbfb2/maintainability)](https://codeclimate.com/github/UiPath/angular-components/maintainability)
[![License](https://badgen.net/badge/license/MIT/blue)]()

## Browser Support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## Installation

`npm i @uipath/angular`

## Documentation

Visit our docs page [here](https://uipath.github.io/angular-components). Thanks go to the [@compodoc](https://compodoc.app/) team! 👌

# Git Conventions

### Commit Messages

We initially started off by using a `custom` commit message convention, now that we've gone OS, we realize it will be much easier for everyone if we adhere to the `conventional-commit` standard.

The project comes preconfigured with `commitlint` and `husky` hooks in order to automate checks.

Another advantage of `conventional-commits` is that it will allow us to later on integrate `semantic-release` with ease.

### Conflict Resolution

We all know that once you open a `PR`, it sometimes goes through a rigorous code review process. Sometimes, due to this delay, we end up with a `PR` that has `conflicts`.

In this scenarios, we're usually used to either `merge` or `rebase`.

We personally prefer that branches get `rebased`, and usually stay away from `merge` commits as they mostly end up polluting the history needlessly. At this point, most of you are probabily thinking: `Yeah, but it's not a good practice to rebase if multiple people are working on the same branch!`.

True, it's not recommended to `rebase` when multiple people are active on the same `branch`, but in this scenario `git` offers a very elegant solution: `fixup` commits. By using `fixup commits`, the branch can later go through an `interactive rebase` once the `review` process is done and the `PR` is approved.

For example: after you make your changes and stage them you can run a `git commit --fixup HEAD~` to add the changes in the last but one commit. Before the merge, you can then simply `git rebase -i <ref> --autosquash` and every change will be squashed in the correct commit.

### Why?

**Q:** Why all the hassle, does it really matter?

**A:** We've seen too many branches where `merge commits` get introduced without a good reason, too many branches that have almost the same number `merge commits` as `commits` so we want to enforce a git usage guidline that promotes responsibility. 🐱‍👤

**Q:** But I want to integrate a branch, not yet merged and implement a new feature.

**A:** In this scenario, you have the `master` branch, and the `feature` branch that you depend upon. What we do in this case, is create a local branch where we merge the required `feature` branch into `master` and start our branch from there. Once the `feature` branch we depend upon, gets merged into `master`, we `rebase` over master. Easy peasy! 🤓

**Q:** But what if I just want to add a feature?

**A:** We think that in software, it's not just about the feature, it's also about the fact that others will later on need to support that feature or modify it, having a good historical track helps everyone better understand the evolution of the codebase.

## Coming Up (most likely v1)

- Getting Started / Contribution Guidlines
- Enhanced Component Demo's
