import { NgbCalendar, NgbPeriod } from './ngb-calendar';
import { NgbDate } from './ngb-date';
import { DatepickerViewModel, NgbMarkDisabled } from './datepicker-view-model';
import { Observable } from 'rxjs/Observable';
export declare class NgbDatepickerService {
    private _calendar;
    private _model$;
    private _select$;
    private _state;
    readonly model$: Observable<DatepickerViewModel>;
    readonly select$: Observable<NgbDate>;
    disabled: boolean;
    displayMonths: number;
    firstDayOfWeek: number;
    focusVisible: boolean;
    maxDate: NgbDate;
    markDisabled: NgbMarkDisabled;
    minDate: NgbDate;
    navigation: 'select' | 'arrows' | 'none';
    constructor(_calendar: NgbCalendar);
    focus(date: NgbDate): void;
    focusMove(period?: NgbPeriod, number?: number): void;
    focusSelect(): void;
    open(date: NgbDate): void;
    select(date: NgbDate, options?: {
        emitEvent?: boolean;
    }): void;
    toValidDate(date: {
        year: number;
        month: number;
        day?: number;
    }, defaultValue?: NgbDate): NgbDate;
    private _nextState(patch);
    private _patchContexts(state);
    private _updateState(patch);
}
