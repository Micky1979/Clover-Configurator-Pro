import { forwardRef, Inject, Directive, Input, Output, EventEmitter, ElementRef, ContentChild, NgZone, Renderer2 } from '@angular/core';
import { NgbDropdownConfig } from './dropdown-config';
import { positionElements } from '../util/positioning';
/**
 */
var NgbDropdownMenu = (function () {
    function NgbDropdownMenu(dropdown, _elementRef, _renderer) {
        this.dropdown = dropdown;
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.placement = 'bottom';
        this.isOpen = false;
    }
    NgbDropdownMenu.prototype.isEventFrom = function ($event) { return this._elementRef.nativeElement.contains($event.target); };
    NgbDropdownMenu.prototype.position = function (triggerEl, placement) {
        this.applyPlacement(positionElements(triggerEl, this._elementRef.nativeElement, placement));
    };
    NgbDropdownMenu.prototype.applyPlacement = function (_placement) {
        // remove the current placement classes
        this._renderer.removeClass(this._elementRef.nativeElement.parentNode, 'dropup');
        this._renderer.removeClass(this._elementRef.nativeElement.parentNode, 'dropdown');
        this.placement = _placement;
        /**
             * apply the new placement
             * in case of top use up-arrow or down-arrow otherwise
             */
        if (_placement.search('^top') !== -1) {
            this._renderer.addClass(this._elementRef.nativeElement.parentNode, 'dropup');
        }
        else {
            this._renderer.addClass(this._elementRef.nativeElement.parentNode, 'dropdown');
        }
    };
    NgbDropdownMenu.decorators = [
        { type: Directive, args: [{ selector: '[ngbDropdownMenu]', host: { '[class.dropdown-menu]': 'true', '[class.show]': 'dropdown.isOpen()' } },] },
    ];
    /** @nocollapse */
    NgbDropdownMenu.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [forwardRef(function () { return NgbDropdown; }),] },] },
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    return NgbDropdownMenu;
}());
export { NgbDropdownMenu };
/**
 * Allows the dropdown to be toggled via click. This directive is optional.
 */
var NgbDropdownToggle = (function () {
    function NgbDropdownToggle(dropdown, _elementRef) {
        this.dropdown = dropdown;
        this._elementRef = _elementRef;
        this.anchorEl = _elementRef.nativeElement;
    }
    NgbDropdownToggle.prototype.toggleOpen = function () { this.dropdown.toggle(); };
    NgbDropdownToggle.prototype.isEventFrom = function ($event) { return this._elementRef.nativeElement.contains($event.target); };
    NgbDropdownToggle.decorators = [
        { type: Directive, args: [{
                    selector: '[ngbDropdownToggle]',
                    host: {
                        'class': 'dropdown-toggle',
                        'aria-haspopup': 'true',
                        '[attr.aria-expanded]': 'dropdown.isOpen()',
                        '(click)': 'toggleOpen()'
                    }
                },] },
    ];
    /** @nocollapse */
    NgbDropdownToggle.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [forwardRef(function () { return NgbDropdown; }),] },] },
        { type: ElementRef, },
    ]; };
    return NgbDropdownToggle;
}());
export { NgbDropdownToggle };
/**
 * Transforms a node into a dropdown.
 */
var NgbDropdown = (function () {
    function NgbDropdown(config, ngZone) {
        var _this = this;
        /**
           *  Defines whether or not the dropdown-menu is open initially.
           */
        this._open = false;
        /**
           *  An event fired when the dropdown is opened or closed.
           *  Event's payload equals whether dropdown is open.
           */
        this.openChange = new EventEmitter();
        this.placement = config.placement;
        this.autoClose = config.autoClose;
        this._zoneSubscription = ngZone.onStable.subscribe(function () { _this._positionMenu(); });
    }
    NgbDropdown.prototype.ngOnInit = function () {
        if (this._menu) {
            this._menu.applyPlacement(Array.isArray(this.placement) ? (this.placement[0]) : this.placement);
        }
    };
    /**
     * Checks if the dropdown menu is open or not.
     */
    /**
       * Checks if the dropdown menu is open or not.
       */
    NgbDropdown.prototype.isOpen = /**
       * Checks if the dropdown menu is open or not.
       */
    function () { return this._open; };
    /**
     * Opens the dropdown menu of a given navbar or tabbed navigation.
     */
    /**
       * Opens the dropdown menu of a given navbar or tabbed navigation.
       */
    NgbDropdown.prototype.open = /**
       * Opens the dropdown menu of a given navbar or tabbed navigation.
       */
    function () {
        if (!this._open) {
            this._open = true;
            this._positionMenu();
            this.openChange.emit(true);
        }
    };
    /**
     * Closes the dropdown menu of a given navbar or tabbed navigation.
     */
    /**
       * Closes the dropdown menu of a given navbar or tabbed navigation.
       */
    NgbDropdown.prototype.close = /**
       * Closes the dropdown menu of a given navbar or tabbed navigation.
       */
    function () {
        if (this._open) {
            this._open = false;
            this.openChange.emit(false);
        }
    };
    /**
     * Toggles the dropdown menu of a given navbar or tabbed navigation.
     */
    /**
       * Toggles the dropdown menu of a given navbar or tabbed navigation.
       */
    NgbDropdown.prototype.toggle = /**
       * Toggles the dropdown menu of a given navbar or tabbed navigation.
       */
    function () {
        if (this.isOpen()) {
            this.close();
        }
        else {
            this.open();
        }
    };
    NgbDropdown.prototype.closeFromClick = function ($event) {
        if (this.autoClose && $event.button !== 2 && !this._isEventFromToggle($event)) {
            if (this.autoClose === true) {
                this.close();
            }
            else if (this.autoClose === 'inside' && this._isEventFromMenu($event)) {
                this.close();
            }
            else if (this.autoClose === 'outside' && !this._isEventFromMenu($event)) {
                this.close();
            }
        }
    };
    NgbDropdown.prototype.closeFromOutsideEsc = function () {
        if (this.autoClose) {
            this.close();
        }
    };
    NgbDropdown.prototype.ngOnDestroy = function () { this._zoneSubscription.unsubscribe(); };
    NgbDropdown.prototype._isEventFromToggle = function ($event) { return this._toggle ? this._toggle.isEventFrom($event) : false; };
    NgbDropdown.prototype._isEventFromMenu = function ($event) { return this._menu ? this._menu.isEventFrom($event) : false; };
    NgbDropdown.prototype._positionMenu = function () {
        if (this.isOpen() && this._menu && this._toggle) {
            this._menu.position(this._toggle.anchorEl, this.placement);
        }
    };
    NgbDropdown.decorators = [
        { type: Directive, args: [{
                    selector: '[ngbDropdown]',
                    exportAs: 'ngbDropdown',
                    host: {
                        '[class.show]': 'isOpen()',
                        '(keyup.esc)': 'closeFromOutsideEsc()',
                        '(document:click)': 'closeFromClick($event)'
                    }
                },] },
    ];
    /** @nocollapse */
    NgbDropdown.ctorParameters = function () { return [
        { type: NgbDropdownConfig, },
        { type: NgZone, },
    ]; };
    NgbDropdown.propDecorators = {
        "_menu": [{ type: ContentChild, args: [NgbDropdownMenu,] },],
        "_toggle": [{ type: ContentChild, args: [NgbDropdownToggle,] },],
        "autoClose": [{ type: Input },],
        "_open": [{ type: Input, args: ['open',] },],
        "placement": [{ type: Input },],
        "openChange": [{ type: Output },],
    };
    return NgbDropdown;
}());
export { NgbDropdown };
//# sourceMappingURL=dropdown.js.map