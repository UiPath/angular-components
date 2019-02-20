# UiPath - Angular Components Library

Library of Angular components, directives, pipes, services or any other common stuff accros Angular apps in UiPath.

## Documentation

### Install

```
$ npm install @uipath/angular-components
```

### Publish a new version

1. set new version in `projects/angular-components/package.json`
2. run `npm run package` - this will create a new `tgz` bundle in `dist/angular-components/` folder
3. run `npm publish ./dist/angular-components/uipath-angular-components-<new package version>.tgz`

This will publish the new version in our private NPM registry: https://uipath.pkgs.visualstudio.com/_packaging/npm-packages/npm/registry/

### Components

TBD

### Directives

#### `ngLet`

Import it's module and add it to the imports:

```javascript
import { UiNgLetModule } from "@uipath/angular-components";

@NgModule({
  imports: [UiNgLetModule]
})
export class YourModule {}
```

Use it in your templates:

```
<ng-container *ngLet="document$ | async as document">
    ...
</ng-container>
```

### Pipes

TBD

### Services

TBD