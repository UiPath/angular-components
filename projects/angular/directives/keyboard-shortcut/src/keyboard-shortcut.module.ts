import { NgModule } from '@angular/core';

import { KeyboardShortcutDirective } from './keyboard-shortcut.directive';

@NgModule({
    declarations: [KeyboardShortcutDirective],
    exports: [KeyboardShortcutDirective],
})
export class KeyboardShortcutModule { }
