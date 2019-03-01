# Browser Utilities

## `extractCookies`

Extracts the browser cookies and returns a map with all the KVs.

```typescript
import { extractCookies } from '@uipath/angular/utilities';

const cookies = extractCookies();

console.log(cookies['myKey']);
```

## `isInternetExplorer`

Returns `true` if the current `user-agent` is Internet Explorer.

```typescript
import { isInternetExplorer } from '@uipath/angular/utilities';

if (isInternetExplorer()) {
  /*
    DISABLE ANIMATIONS...
  */
}
```
