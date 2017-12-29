import { EventEmitter, ElementRef, NgZone, Renderer2, OnInit } from '@angular/core';
import { NgbDropdownConfig } from './dropdown-config';
import { PlacementArray, Placement } from '../util/positioning';
/**
 */
export declare class NgbDropdownMenu {
    dropdown: any;
    private _elementRef;
    private _renderer;
    placement: Placement;
    isOpen: boolean;
    constructor(dropdown: any, _elementRef: ElementRef, _renderer: Renderer2);
    isEventFrom($event: any): any;
    position(triggerEl: any, placement: any): void;
    applyPlacement(_placement: Placement): void;
}
/**
 * Allows the dropdown to be toggled via click. This directive is optional.
 */
export declare class NgbDropdownToggle {
    dropdown: any;
    private _elementRef;
    anchorEl: any;
    constructor(dropdown: any, _elementRef: ElementRef);
    toggleOpen(): void;
    isEventFrom($event: any): any;
}
/**
 * Transforms a node into a dropdown.
 */
export declare class NgbDropdown implements OnInit {
    private _zoneSubscription;
    private _menu;
    private _toggle;
    /**
     * Indicates that dropdown should be closed when selecting one of dropdown items (click) or pressing ESC.
     * When it is true (default) dropdowns are automatically closed on both outside and inside (menu) clicks.
     * When it is false dropdowns are never automatically closed.
     * When it is 'outside' dropdowns are automatically closed on outside clicks but not on menu clicks.
     * When it is 'inside' dropdowns are automatically on menu clicks but not on outside clicks.
     */
    autoClose: boolean | 'outside' | 'inside';
    /**
     *  Defines whether or not the dropdown-menu is open initially.
     */
    _open: boolean;
    /**
     * Placement of a popover accepts:
     *    "top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right",
     *    "left", "left-top", "left-bottom", "right", "right-top", "right-bottom"
     * and array of above values.
     */
    placement: PlacementArray;
    /**
     *  An event fired when the dropdown is opened or closed.
     *  Event's payload equals whether dropdown is open.
     */
    openChange: EventEmitter<{}>;
    constructor(config: NgbDropdownConfig, ngZone: NgZone);
    ngOnInit(): void;
    /**
     * Checks if the dropdown menu is open or not.
     */
    isOpen(): boolean;
    /**
     * Opens the dropdown menu of a given navbar or tabbed navigation.
     */
    open(): void;
    /**
     * Closes the dropdown menu of a given navbar or tabbed navigation.
     */
    close(): void;
    /**
     * Toggles the dropdown menu of a given navbar or tabbed navigation.
     */
    toggle(): void;
    closeFromClick($event: any): void;
    closeFromOutsideEsc(): void;
    ngOnDestroy(): void;
    private _isEventFromToggle($event);
    private _isEventFromMenu($event);
    private _positionMenu();
}
