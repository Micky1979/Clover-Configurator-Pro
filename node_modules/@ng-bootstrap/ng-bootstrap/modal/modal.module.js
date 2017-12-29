import { NgModule } from '@angular/core';
import { NgbModalBackdrop } from './modal-backdrop';
import { NgbModalWindow } from './modal-window';
import { NgbModalStack } from './modal-stack';
import { NgbModal } from './modal';
export { NgbModal } from './modal';
export { NgbModalRef, NgbActiveModal } from './modal-ref';
export { ModalDismissReasons } from './modal-dismiss-reasons';
var NgbModalModule = (function () {
    function NgbModalModule() {
    }
    NgbModalModule.forRoot = function () { return { ngModule: NgbModalModule, providers: [NgbModal, NgbModalStack] }; };
    NgbModalModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [NgbModalBackdrop, NgbModalWindow],
                    entryComponents: [NgbModalBackdrop, NgbModalWindow],
                    providers: [NgbModal]
                },] },
    ];
    /** @nocollapse */
    NgbModalModule.ctorParameters = function () { return []; };
    return NgbModalModule;
}());
export { NgbModalModule };
//# sourceMappingURL=modal.module.js.map