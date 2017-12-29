import { NgModule } from '@angular/core';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from './dropdown';
import { NgbDropdownConfig } from './dropdown-config';
export { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from './dropdown';
export { NgbDropdownConfig } from './dropdown-config';
var NGB_DROPDOWN_DIRECTIVES = [NgbDropdown, NgbDropdownToggle, NgbDropdownMenu];
var NgbDropdownModule = (function () {
    function NgbDropdownModule() {
    }
    NgbDropdownModule.forRoot = function () { return { ngModule: NgbDropdownModule, providers: [NgbDropdownConfig] }; };
    NgbDropdownModule.decorators = [
        { type: NgModule, args: [{ declarations: NGB_DROPDOWN_DIRECTIVES, exports: NGB_DROPDOWN_DIRECTIVES },] },
    ];
    /** @nocollapse */
    NgbDropdownModule.ctorParameters = function () { return []; };
    return NgbDropdownModule;
}());
export { NgbDropdownModule };
//# sourceMappingURL=dropdown.module.js.map