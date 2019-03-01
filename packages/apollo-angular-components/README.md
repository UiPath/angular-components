# UiPath - Angular Components Library

Library of Angular components, directives, pipes, services or any other common stuff accros Angular apps in UiPath.

## Documentation

### Install

```
$ npm install @uipath/angular
```

### Publish a new version

1. set new version in `projects/angular/package.json`
2. run `npm run package` - this will create a new `tgz` bundle in `dist/angular/` folder
3. run `npm publish ./dist/angular/uipath-angular-<new package version>.tgz`

This will publish the new version in our private NPM registry: https://uipath.pkgs.visualstudio.com/_packaging/npm-packages/npm/registry/
