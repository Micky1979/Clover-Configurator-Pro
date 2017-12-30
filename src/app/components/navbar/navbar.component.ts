import { Component, TemplateRef, HostListener, HostBinding, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'ccphp-navbar',
  templateUrl: './navbar.component.html',
  animations: [
    trigger('collapse', [
      state('open', style({
        opacity: '1',
        display: 'block',
        transform: 'translate3d(0, 0, 0)'
      })),
      state('closed', style({
        opacity: '0',
        display: 'none',
        transform: 'translate3d(-50%, 0, 0)'
      })),
      transition('closed => open', animate('400ms ease-in')),
      transition('open => closed', animate('400ms ease-out'))
    ])
  ]
})
export class NavbarComponent implements OnInit {
  public navbarCollapsed: boolean;
  public _navbarCollapsedAnim: string;

  constructor() {
    this.navbarCollapsed = true;
    this._navbarCollapsedAnim = 'closed';
}

  ngOnInit() {
    this.onResize(window);
  }
  @HostListener('window:resize', ['$event.target'])
  onResize(event) {
    if (event.innerWidth > 990) {
      // need to set this to 'open' for large screens to show up because of opacity in 'closed' animation.
      this._navbarCollapsedAnim = 'open';
    } else {
      // comment this line if you don't want to collapse the navbar when window is resized.
      this._navbarCollapsedAnim = 'closed';
    }
    this.navbarCollapsed = true;
  }

  toggleNavbar(): void {
    if (this.navbarCollapsed) {
      this._navbarCollapsedAnim = 'open';
      this.navbarCollapsed = false;
    } else {
      this._navbarCollapsedAnim = 'closed';
      this.navbarCollapsed = true;
    }
  }

  get collapseNavbar(): string {
    return this._navbarCollapsedAnim;
  }
}
