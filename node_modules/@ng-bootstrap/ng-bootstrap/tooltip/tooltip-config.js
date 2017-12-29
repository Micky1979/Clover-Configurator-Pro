import { Injectable } from '@angular/core';
/**
 * Configuration service for the NgbTooltip directive.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the tooltips used in the application.
 */
var NgbTooltipConfig = (function () {
    function NgbTooltipConfig() {
        this.placement = 'top';
        this.triggers = 'hover';
    }
    NgbTooltipConfig.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    NgbTooltipConfig.ctorParameters = function () { return []; };
    return NgbTooltipConfig;
}());
export { NgbTooltipConfig };
//# sourceMappingURL=tooltip-config.js.map