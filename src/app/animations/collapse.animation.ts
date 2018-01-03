import { trigger, state, animate, transition, style } from '@angular/animations';

export const collapseAnimation =
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
    ]);
