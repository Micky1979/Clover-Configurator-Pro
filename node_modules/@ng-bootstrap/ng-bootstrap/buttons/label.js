import { Directive } from '@angular/core';
var NgbButtonLabel = (function () {
    function NgbButtonLabel() {
    }
    NgbButtonLabel.decorators = [
        { type: Directive, args: [{
                    selector: '[ngbButtonLabel]',
                    host: { '[class.btn]': 'true', '[class.active]': 'active', '[class.disabled]': 'disabled', '[class.focus]': 'focused' }
                },] },
    ];
    /** @nocollapse */
    NgbButtonLabel.ctorParameters = function () { return []; };
    return NgbButtonLabel;
}());
export { NgbButtonLabel };
//# sourceMappingURL=label.js.map