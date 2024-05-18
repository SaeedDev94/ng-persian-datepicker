import { Jalali } from 'jalali-ts';
import { Subscription } from 'rxjs';
import { defaultTheme } from './theme';
import { faWeekDays, faMonths, enMonths, enWeekDays } from './pipe/locale';
import {
  IActiveDate,
  IDay,
  IMonth,
  IYear,
  IDatepickerTheme
} from './interface';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  FormControl,
  FormControlDirective,
  FormControlName
} from '@angular/forms';

@Component({
  selector: 'ng-persian-datepicker',
  templateUrl: './ng-persian-datepicker.component.html',
  styleUrls: ['./ng-persian-datepicker.component.scss']
})
export class NgPersianDatepickerComponent implements OnInit, OnDestroy {

  constructor(
    private elementRef: ElementRef<HTMLElement | null>
  ) {
    this.setToday();
  }

  private input?: HTMLInputElement;
  private inputEventFocusListener?: () => void;

  private formControl?: FormControl<string | number | null | undefined>;
  private formControlValueChanges?: Subscription;

  private dateValue?: number;
  private lastEmittedDateValue?: number;
  private preventClose: boolean = false;

  private uiYearView: boolean = true;
  private uiMonthView: boolean = true;

  private today!: Jalali;
  private viewDate!: Jalali;
  private selectedDate?: Jalali;

  private wasInsideClick: boolean = false;

  viewDateTitle: string = '';
  viewModes: string[] = [];
  viewModeIndex: number = 0;

  weekDays: string[] = faWeekDays;

  years: IYear[] = [];
  months: IMonth[] = [];
  days: IDay[][] = [];

  hour: number = 0;
  minute: number = 0;
  second: number = 0;

  /** @ReactiveForm */

  @ContentChild(FormControlDirective, {static: false})
  set _formControlDirective(value: FormControlDirective | undefined) {
    this.setFormControl(value?.control);
  }

  @ContentChild(FormControlName, {static: false})
  set _formControlName(value: FormControlName | undefined) {
    this.setFormControl(value?.control);
  }

  /** @Input */

  // calendar
  calendarIsGregorian: boolean = false;
  @Input('calendarIsGregorian')
  set _calendarIsGregorian(value: boolean) {
    this.weekDays = value ? enWeekDays : faWeekDays;
    this.calendarIsGregorian = value;
  }

  // date
  @Input('dateValue')
  inputDateValue?: FormControl;

  @Input()
  dateInitValue: boolean = true;

  @Input()
  dateIsGregorian: boolean = false;

  dateFormat: string = 'YYYY/MM/DD';
  @Input('dateFormat')
  set _dateFormat(value: string) {
    this.dateFormat = value.replace(new RegExp('j', 'g'), '');
  }

  @Input()
  dateGregorianFormat: string = 'YYYY-MM-DD';

  dateMin: number | null = null;
  @Input('dateMin')
  set _dateMin(value: number | null) {
    this.dateMin = value;
    if (this.days.length) this.setViewDate();
  }

  dateMax: number | null = null;
  @Input('dateMax')
  set _dateMax(value: number | null) {
    this.dateMax = value;
    if (this.days.length) this.setViewDate();
  }

  // time
  timeEnable: boolean = false;
  @Input('timeEnable')
  set _timeEnable(value: boolean) {
    this.timeEnable = value;
    if (!this.timeEnable && this.dateValueDefined()) this.onChangeSelectedDate(true);
    this.setTime();
  }

  timeShowSecond: boolean = false;
  @Input('timeShowSecond')
  set _timeShowSecond(value: boolean) {
    this.timeShowSecond = value;
  }

  timeMeridian: boolean = false;
  @Input('timeMeridian')
  set _timeMeridian(value: boolean) {
    this.timeMeridian = value;
  }

  // ui
  uiTheme: IDatepickerTheme = defaultTheme;
  @Input('uiTheme')
  set _uiTheme(value: Partial<IDatepickerTheme>) {
    this.uiTheme = { ...defaultTheme, ...value };
  }

  @Input()
  uiIsVisible: boolean = false;

  @Input()
  uiHideOnOutsideClick: boolean = true;

  @Input()
  uiHideAfterSelectDate: boolean = true;

  @Input('uiYearView')
  set _uiYearView(value: boolean) {
    this.uiYearView = value;
    this.checkViewModes();
    this.setViewDateTitle();
  }

  @Input('uiMonthView')
  set _uiMonthView(value: boolean) {
    this.uiMonthView = value;
    this.checkViewModes();
    this.setViewDateTitle();
  }

  @Input()
  uiInitViewMode: 'year' | 'month' | 'day' = 'day';

  @Input()
  uiTodayBtnEnable: boolean = true;

  /** @Output */

  // date
  @Output()
  dateOnInit: EventEmitter<IActiveDate> = new EventEmitter<IActiveDate>();

  @Output()
  dateOnSelect: EventEmitter<IActiveDate> = new EventEmitter<IActiveDate>();

  // ui
  @Output()
  uiIsVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.setViewModes();
    this.setInitViewMode();
    this.setShowOnInputFocus();

    if (this.inputDateValue) this.setFormControl(this.inputDateValue);
  }

  ngOnDestroy(): void {
    this.formControlValueChanges?.unsubscribe();

    if (this.input) {
      this.input.removeEventListener('focus', this.inputEventFocusListener!);
    }
  }

  dateValueDefined(): boolean {
    return typeof this.dateValue === 'number';
  }

  setFormControl(value: FormControl | undefined): void {
    if (!value) return;

    this.formControl = value;

    if (!this.dateValueDefined()) {
      this.setDateInitValue(this.formControl?.value);
      this.setSelectedDate(this.formControl?.value);
      this.setViewDate();
      this.setTime();
      this.setFormControlValue();
    }

    this.formControlValueChanges?.unsubscribe();
    this.formControlValueChanges = this.formControl
      ?.valueChanges
      ?.subscribe({
        next: (value: string | number | null | undefined) => {
          if ((typeof value === 'string' && !value.trim() || (typeof value === 'number' && Number.isNaN(value)) || value === null || value === undefined)) {
            this.dateValue = undefined;
            this.lastEmittedDateValue = undefined;
            this.selectedDate = undefined;
            this.setViewDate();
            return;
          }

          let valueOf: number | undefined = undefined;
          try {
            valueOf = this.valueOfDate(value);
          } catch (e) {
            return;
          }

          if (typeof valueOf === 'undefined' || valueOf === this.dateValue) {
            return;
          }

          const date = Jalali.timestamp(valueOf, false);
          if (!this.isDateInRange(date.valueOf(), false, false)) {
            return;
          }

          this.setTime(date);
          this.changeSelectedDate(date, false);
        }
      });
  }

  setToday(): void {
    const today = Jalali.now(false);
    if (!this.timeEnable) today.startOf('day');
    this.today = today;
  }

  setViewModes(): void {
    this.viewModes = ['day'];
    if (this.uiMonthView) {
      this.viewModes.push('month');
    }
    if (this.uiYearView) {
      this.viewModes.push('year');
    }
    if (this.viewModes.length <= this.viewModeIndex) {
      this.viewModeIndex = 0;
    }
  }

  setInitViewMode(): void {
    const index: number = this.viewModes.indexOf(this.uiInitViewMode);
    if (index !== -1) this.viewModeIndex = index;
  }

  checkViewModes(): void {
    let viewModesCount: number = 1;
    if (this.uiYearView) {
      viewModesCount++;
    }
    if (this.uiMonthView) {
      viewModesCount++;
    }
    if (viewModesCount !== this.viewModes.length) {
      this.setViewModes();
    }
  }

  setDateInitValue(dateValue: string | number | null | undefined): void {
    if (dateValue || !this.dateInitValue) {
      return;
    }
    this.dateValue = this.today.valueOf();
    this.selectedDate = Jalali.timestamp(this.dateValue, false);
    this.lastEmittedDateValue = +this.selectedDate;
    this.dateOnInit.next({
      shamsi: String(this.selectedDate.format(this.dateFormat)),
      gregorian: String(this.selectedDate.gregorian(this.dateGregorianFormat)),
      timestamp: Number(this.selectedDate.valueOf())
    });
  }

  setSelectedDate(dateValue: string | number | null | undefined): void {
    if (!dateValue) {
      return;
    }

    const date = Jalali.timestamp(this.valueOfDate(dateValue), false);
    if (!this.timeEnable) date.startOf('day');
    this.dateValue = date.valueOf();
    this.selectedDate = date;
  }

  setViewDate(): void {
    if (!this.dateValueDefined()) {
      this.viewDate = this.dateMax ? Jalali.timestamp(this.dateMax, false) : this.today.clone();
    } else {
      this.viewDate = this.dateMax && this.selectedDate!.valueOf() > this.dateMax.valueOf() ?
        Jalali.timestamp(this.dateMax, false) : this.selectedDate!.clone();
    }
    if (!this.timeEnable) this.viewDate.startOf('day');
    this.onChangeViewDate();
  }

  onChangeViewDate(): void {
    if (this.calendarIsGregorian) {
      this.viewDate.date.setDate(1);
    } else {
      this.viewDate.startOf('month');
    }
    this.setYears();
    this.setMonths();
    this.setDays();
    this.setViewDateTitle();
  }

  setYears(): void {
    this.years = [];
    const clone = this.viewDate.clone();
    const years = this.calendarIsGregorian ? clone.date : clone;
    if (years instanceof Date) {
      years.setDate(1);
      years.setMonth(0);
      years.setFullYear(years.getFullYear() - 6);
    } else {
      years.startOf('year');
      years.add(-6, 'year');
    }
    for (let i = 0 ; i < 12 ; i++) {
      const year: number[] = [+years, years.getFullYear()];
      this.years.push({
        timestamp: year[0],
        value: year[1],
        isYearOfTodayDate: this.isYearOfTodayDate(year),
        isYearOfSelectedDate: this.isYearOfSelectedDate(year),
        isYearDisabled: this.isYearDisabled(year)
      });
      if (years instanceof Date) {
        years.setFullYear(years.getFullYear() + 1);
      } else {
        years.add(1, 'year');
      }
    }
  }

  setMonths(): void {
    this.months = [];
    const clone = this.viewDate.clone();
    const months = this.calendarIsGregorian ? clone.date : clone;
    if (months instanceof Date) {
      months.setDate(1);
      months.setMonth(0);
    } else {
      months.startOf('year');
    }
    for (let i = 0 ; i < 12 ; i++) {
      const month: number[] = [+months, months.getFullYear(), months.getMonth()];
      this.months.push({
        timestamp: month[0],
        year: month[1],
        indexValue: month[2],
        isMonthOfTodayDate: this.isMonthOfToday(month),
        isMonthOfSelectedDate: this.isMonthOfSelectedDate(month),
        isMonthDisabled: this.isMonthDisabled(month)
      });
      if (months instanceof Date) {
        months.setMonth(months.getMonth() + 1);
      } else {
        months.add(1, 'month');
      }
    }
  }

  setDays(): void {
    this.days = [];

    const prevMonthDetails: number[][] = [];
    const currentMonthDetails: number[][] = [];
    const nextMonthDetails: number[][] = [];

    const prevMonth = Jalali.timestamp(+this.viewDate, false);
    const currentMonth = Jalali.timestamp(+this.viewDate, false);
    const nextMonth = Jalali.timestamp(+this.viewDate, false);

    if (this.calendarIsGregorian) {
      prevMonth.date.setMonth(prevMonth.date.getMonth() - 1);
      nextMonth.date.setMonth(nextMonth.date.getMonth() + 1);
    } else {
      prevMonth.add(-1, 'month');
      nextMonth.add(1, 'month');
    }

    const gregorianMonthDays = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const currentMonthDays: number = this.calendarIsGregorian ? gregorianMonthDays(currentMonth.date) : currentMonth.monthLength();
    const prevMonthDays: number = this.calendarIsGregorian ? gregorianMonthDays(prevMonth.date) : prevMonth.monthLength();
    const nextMonthDays: number = this.calendarIsGregorian ? gregorianMonthDays(nextMonth.date) : nextMonth.monthLength();

    for (let i = 0 ; i < prevMonthDays ; i++) {
      if (this.calendarIsGregorian) {
        prevMonthDetails.push([+prevMonth.date, prevMonth.date.getFullYear(), prevMonth.date.getMonth(), prevMonth.date.getDate()]);
      } else {
        prevMonthDetails.push([+prevMonth, prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate()]);
      }
      prevMonth.add(1, 'day');
    }
    for (let i = 0 ; i < currentMonthDays ; i++) {
      if (this.calendarIsGregorian) {
        currentMonthDetails.push([+currentMonth, currentMonth.date.getFullYear(), currentMonth.date.getMonth(), currentMonth.date.getDate()]);
      } else {
        currentMonthDetails.push([+currentMonth, currentMonth.getFullYear(), currentMonth.getMonth(), currentMonth.getDate()]);
      }
      currentMonth.add(1, 'day');
    }
    for (let i = 0 ; i < nextMonthDays ; i++) {
      if (this.calendarIsGregorian) {
        nextMonthDetails.push([+nextMonth, nextMonth.date.getFullYear(), nextMonth.date.getMonth(), nextMonth.date.getDate()]);
      } else {
        nextMonthDetails.push([+nextMonth, nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate()]);
      }
      nextMonth.add(1, 'day');
    }

    for (let row = 0; row < 6 ; row++) {
      const rowValue: IDay[] = [];

      for (let col = 0; col < 7 ; col++) {
        const fromPrevMonth: number = this.calendarIsGregorian ?
          this.viewDate.date.getDay() :
          (this.viewDate.date.getDay() === 6) ? 0 : (this.viewDate.date.getDay() + 1);
        let index: number = ((row * 7) + col) - fromPrevMonth;
        let day: number[] = [];

        if (index < 0) {
          index = prevMonthDetails.length - (fromPrevMonth - col);
          day = prevMonthDetails[index];
        } else if (index >= currentMonthDetails.length) {
          index = index - currentMonthDetails.length;
          day = nextMonthDetails[index];
        } else {
          day = currentMonthDetails[index];
        }

        rowValue.push({
          timestamp: day[0],
          year: day[1],
          monthIndex: day[2],
          value: day[3],
          isDayInCurrentMonth: this.isDayInCurrentMonth(day),
          isDayOfTodayDate: this.isDayOfTodayDate(day),
          isDayOfSelectedDate: this.isDayOfSelectedDate(day),
          isDayDisabled: this.isDayDisabled(day)
        });
      }

      this.days.push(rowValue);
    }
  }

  setViewDateTitle(): void {
    if (!this.viewDate) {
      return;
    }
    const date = this.calendarIsGregorian ? this.viewDate.date : this.viewDate;
    const year: number = date.getFullYear();
    switch (this.viewModes[this.viewModeIndex]) {
      case 'day':
        this.viewDateTitle = `${this.calendarIsGregorian ? enMonths[date.getMonth()] : faMonths[date.getMonth()]} ${year}`;
        break;
      case 'month':
        this.viewDateTitle = year.toString();
        break;
      case 'year':
        this.viewDateTitle = (year - 6).toString() + '-' + (year + 5).toString();
        break;
    }
  }

  setTime(date: Jalali | null = null): void {
    if (date) {
      this.hour = date.getHours();
      this.minute = date.getMinutes();
      this.second = date.getSeconds();
    } else if (this.selectedDate) {
      this.hour = this.selectedDate.getHours();
      this.minute = this.selectedDate.getMinutes();
      this.second = this.selectedDate.getSeconds();
    } else {
      this.hour = this.today.getHours();
      this.minute = this.today.getMinutes();
      this.second = this.today.getSeconds();
    }
  }

  setFormControlValue(): void {
    if (!this.formControl) {
      return;
    }

    if (this.dateValueDefined()) {
      this.formControl?.setValue(Jalali.timestamp(this.dateValue!, false).format(this.dateFormat, this.calendarIsGregorian));
    }
  }

  setShowOnInputFocus(): void {
    const input = this.elementRef.nativeElement?.querySelector('input') as (HTMLInputElement | null);

    if (!input) {
      return;
    }

    this.inputEventFocusListener = () => {
      if (!this.uiIsVisible) {
        this.setUiIsVisible(true);
      }
    };

    this.input = input;
    this.input.addEventListener('focus', this.inputEventFocusListener);
  }

  skipViewDate(skip: number, type: number): void {
    if (type === 1) {
      this.calendarIsGregorian ?
        this.viewDate.date.setFullYear(this.viewDate.date.getFullYear() + skip) :
        this.viewDate.add(skip, 'year');
    } else if (type === 2) {
      this.calendarIsGregorian ?
        this.viewDate.date.setMonth(this.viewDate.date.getMonth() + skip) :
        this.viewDate.add(skip, 'month');
    }
  }

  navigate(forward: boolean): void {
    let skip: number = 1;
    if (!forward) {
      skip = skip * -1;
    }
    switch (this.viewModes[this.viewModeIndex]) {
      case 'day':
        this.skipViewDate(skip, 2);
        break;
      case 'month':
        this.skipViewDate(skip, 1);
        break;
      case 'year':
        this.skipViewDate((skip * 12), 1);
        break;
    }
    this.onChangeViewDate();
  }

  nextViewMode(): void {
    if (this.viewModes.length === 1) {
      return;
    }

    if (this.viewModes.length <= (this.viewModeIndex + 1)) {
      this.viewModeIndex = 0;
    } else {
      this.viewModeIndex++;
    }

    this.setViewDateTitle();
  }

  selectToday(): void {
    this.setToday();
    this.preventClose = true;
    this.changeSelectedDate(this.today);
  }

  yearClick(year: IYear): void {
    if (year.isYearDisabled) {
      return;
    }
    this.viewDate = Jalali.timestamp(year.timestamp, false);
    let viewModeIndex: number = this.viewModes.indexOf('month');
    if (viewModeIndex === -1) {
      viewModeIndex = this.viewModes.indexOf('day');
    }
    this.viewModeIndex = viewModeIndex;
    this.onChangeViewDate();
  }

  monthClick(month: IMonth): void {
    if (month.isMonthDisabled) {
      return;
    }
    this.viewDate = Jalali.timestamp(month.timestamp, false);
    this.viewModeIndex = this.viewModes.indexOf('day');
    this.onChangeViewDate();
  }

  dayClick(day: IDay): void {
    if (day.isDayDisabled) {
      return;
    }
    this.changeSelectedDate(Jalali.timestamp(day.timestamp, false));
  }

  isYearOfTodayDate(year: number[]): boolean {
    const date = this.calendarIsGregorian ? this.today.date : this.today;
    return (
      year[1] === date.getFullYear()
    );
  }

  isYearOfSelectedDate(year: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    const date = this.calendarIsGregorian ? this.selectedDate.date : this.selectedDate;
    return (
      year[1] === date.getFullYear()
    );
  }

  isYearDisabled(month: number[]): boolean {
    return !this.isDateInRange(month[0], true, false);
  }

  isMonthOfToday(month: number[]): boolean {
    const date = this.calendarIsGregorian ? this.today.date : this.today;
    return (
      month[1] === date.getFullYear() &&
      month[2] === date.getMonth()
    );
  }

  isMonthOfSelectedDate(month: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    const date = this.calendarIsGregorian ? this.selectedDate.date : this.selectedDate;
    return (
      month[1] === date.getFullYear() &&
      month[2] === date.getMonth()
    );
  }

  isMonthDisabled(month: number[]): boolean {
    return !this.isDateInRange(month[0], false, true);
  }

  isDayInCurrentMonth(day: number[]): boolean {
    const date = this.calendarIsGregorian ? this.viewDate.date : this.viewDate;
    return (
      day[1] === date.getFullYear() &&
      day[2] === date.getMonth()
    );
  }

  isDayOfTodayDate(day: number[]): boolean {
    const date = this.calendarIsGregorian ? this.today.date : this.today;
    return (
      day[1] === date.getFullYear() &&
      day[2] === date.getMonth() &&
      day[3] === date.getDate()
    );
  }

  isDayOfSelectedDate(day: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    const date = this.calendarIsGregorian ? this.selectedDate.date : this.selectedDate;
    return (
      day[1] === date.getFullYear() &&
      day[2] === date.getMonth() &&
      day[3] === date.getDate()
    );
  }

  isDayDisabled(day: number[]): boolean {
    return !this.isDateInRange(day[0], false, false);
  }

  isDateInRange(date: number, isYear: boolean, isMonth: boolean): boolean {
    const result: boolean[] = [];
    if (this.dateMin) {
      const min = Jalali.timestamp(this.dateMin, false);
      if (isYear) {
        if (this.calendarIsGregorian) {
          min.date.setDate(1);
          min.date.setMonth(0);
        } else {
          min.startOf('year');
        }
      }
      if (isMonth) {
        if (this.calendarIsGregorian) {
          min.date.setDate(1);
        } else {
          min.startOf('month');
        }
      }
      result.push(min.valueOf() <= date);
    }
    if (this.dateMax) {
      const max = Jalali.timestamp(this.dateMax, false);
      if (isYear) {
        if (this.calendarIsGregorian) {
          max.date.setDate(1);
          max.date.setMonth(0);
        } else {
          max.startOf('year');
        }
      }
      if (isMonth) {
        if (this.calendarIsGregorian) {
          max.date.setDate(1);
        } else {
          max.startOf('month');
        }
      }
      result.push(max.valueOf() >= date);
    }
    return !(result.indexOf(false) !== -1);
  }

  changeSelectedDate(date: Jalali, setInputValue: boolean = true): void {
    this.selectedDate = date.clone();
    this.onChangeSelectedDate(setInputValue);
  }

  onChangeSelectedDate(setInputValue: boolean): void {
    if (this.timeEnable) {
      this.selectedDate!.setHours(this.hour);
      this.selectedDate!.setMinutes(this.minute);
      this.selectedDate!.setSeconds(this.second);
      this.selectedDate!.setMilliseconds(0);
    } else {
      this.selectedDate!.startOf('day');
    }
    this.dateValue = this.selectedDate!.valueOf();
    if (this.uiHideAfterSelectDate && !this.preventClose) {
      this.setUiIsVisible(false);
    } else {
      this.preventClose = false;
    }
    if (this.lastEmittedDateValue === +this.selectedDate!) return;
    if (setInputValue) {
      this.setFormControlValue();
    }
    this.setViewDate();
    this.lastEmittedDateValue = +this.selectedDate!;
    this.dateOnSelect.next({
      shamsi: String(this.selectedDate!.format(this.dateFormat)),
      gregorian: String(this.selectedDate!.gregorian(this.dateGregorianFormat)),
      timestamp: Number(this.selectedDate!.valueOf())
    });
  }

  set12Hour(value: number): void {
    let hour: number = value;
    const isAM: boolean = this.hour < 12;
    const isPM: boolean = this.hour >= 12;
    if (isAM && hour === 12) {
      hour = 0;
    }
    if (isPM && hour === 12) {
      hour = 12;
    }
    if (isPM && hour < 12) {
      hour = value + 12;
    }
    this.setHour(hour);
  }

  setHour(value: number): void {
    if (value === this.hour) {
      return;
    }
    this.hour = value;
    this.onTimeChange();
  }

  setMinute(value: number): void {
    if (value === this.minute) {
      return;
    }
    this.minute = value;
    this.onTimeChange();
  }

  setSecond(value: number): void {
    if (value === this.second) {
      return;
    }
    this.second = value;
    this.onTimeChange();
  }

  toggleAmPm(current: 'AM' | 'PM'): void {
    if ((current === 'AM' && this.hour < 12) || (current === 'PM' && this.hour >= 12)) {
      return;
    }
    if (this.hour < 12) {
      this.hour += 12;
    } else {
      this.hour -= 12;
    }
    this.onTimeChange();
  }

  onTimeChange(): void {
    this.preventClose = true;
    if (!this.selectedDate) this.selectedDate = this.today.clone();
    this.changeSelectedDate(this.selectedDate);
  }

  @HostListener('click')
  onInsideClick(): void {
    this.wasInsideClick = true;
  }

  @HostListener('document:click')
  onOutsideClick(): void {
    const wasInsideClick: boolean = Boolean(this.wasInsideClick);
    this.wasInsideClick = false;

    if (wasInsideClick || !this.uiHideOnOutsideClick) {
      return;
    }

    this.setUiIsVisible(false);
  }

  private valueOfDate(date: string | number): number {
    if (typeof date === 'string') {
      const gregorian: boolean = (this.calendarIsGregorian || (this.dateIsGregorian && !this.dateValueDefined()));
      return gregorian ? +Jalali.gregorian(date, false) : +Jalali.parse(date, false);
    }

    return date;
  }

  private setUiIsVisible(value: boolean): void {
    this.uiIsVisible = value;
    this.uiIsVisibleChange.next(value);
  }

}
