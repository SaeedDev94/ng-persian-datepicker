import moment from 'moment-jalaali';
import { Subscription } from 'rxjs';
import { defaultTheme } from './theme';
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
    moment.loadPersian({
      usePersianDigits: false,
      dialect: 'persian-modern'
    });

    this.setToday();
    this.setWeekDays();
  }

  private input?: HTMLInputElement;
  private inputEventFocusListener?: () => void;

  private formControl?: FormControl;
  private formControlValueChanges?: Subscription;

  private dateValue: number = 0;
  private preventClose: boolean = false;

  private uiYearView: boolean = true;
  private uiMonthView: boolean = true;

  private today!: moment.Moment;
  private selectedDate!: moment.Moment;
  private viewDate!: moment.Moment;

  private wasInsideClick: boolean = false;

  viewDateTitle: string = '';
  viewModes: string[] = [];
  viewModeIndex: number = 0;

  weekDays: string[] = [];

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

  @Input('dateValue')
  set _dateValue(value: FormControl) {
    this.setFormControl(value);
  }

  /** @Input */

  // date
  @Input()
  dateInitValue: boolean = true;

  @Input()
  dateIsGregorian: boolean = false;

  @Input()
  dateFormat: string = 'jYYYY-jMM-jDD HH:mm:ss';

  @Input()
  dateGregorianFormat: string = 'YYYY-MM-DD HH:mm:ss';

  @Input()
  dateMin: number | null = null;

  @Input()
  dateMax: number | null = null;

  // time
  timeEnable: boolean = true;
  @Input('timeEnable')
  set _timeEnable(value: boolean) {
    this.timeEnable = value;
    this.setTime();
    this.scrollIntoActiveTime();
  }

  timeShowSecond: boolean = true;
  @Input('timeShowSecond')
  set _timeShowSecond(value: boolean) {
    this.timeShowSecond = value;
    this.scrollIntoActiveTime();
  }

  timeMeridian: boolean = false;
  @Input('timeMeridian')
  set _timeMeridian(value: boolean) {
    this.timeMeridian = value;
    this.scrollIntoActiveTime();
  }

  // ui
  uiTheme: IDatepickerTheme = defaultTheme;
  @Input('uiTheme')
  set _uiTheme(value: IDatepickerTheme | string) {
    if (typeof value === 'string') {
      console.warn('DEPRECATED => uiTheme: string');
      console.warn('Please migrate to NEW => uiTheme: IDatepickerTheme');
      console.warn('Using "defaultTheme: IDatepickerTheme" for now ...');

      this.uiTheme = defaultTheme;

      return;
    }

    this.uiTheme = value;
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
  }

  ngOnDestroy(): void {
    this.formControlValueChanges?.unsubscribe();

    if (this.input) {
      this.input.removeEventListener('focus', this.inputEventFocusListener!);
    }
  }

  setFormControl(value: FormControl | undefined): void {
    if (!value) return;

    this.formControl = value;

    if (!this.dateValue) {
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
        next: (value: string | number) => {
          if (!value || this.valueOfDate(value) === this.dateValue) return;

          const date: moment.Moment = moment(value, this.dateFormat);
          if (!date.isValid() || !this.isDateInRange(date.valueOf(), false, false)) {
            return;
          }

          this.setTime(date);
          this.changeSelectedDate(date, false);
          this.scrollIntoActiveTime();
        }
      });
  }

  setToday(): void {
    const today: moment.Moment = moment();
    if (!this.timeEnable) today.startOf('day');
    this.today = today;
  }

  setWeekDays(): void {
    this.weekDays = moment.weekdaysMin();
    this.weekDays.unshift(this.weekDays.pop()!);
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

  setDateInitValue(dateValue: string | number): void {
    if (dateValue || !this.dateInitValue) {
      return;
    }
    this.dateValue = this.today.valueOf();
    this.selectedDate = moment(this.dateValue);
    this.dateOnInit.next({
      shamsi: String(this.selectedDate.format(this.dateFormat)),
      gregorian: String(this.selectedDate.format(this.dateGregorianFormat)),
      timestamp: Number(this.selectedDate.valueOf())
    });
  }

  setSelectedDate(dateValue: string | number): void {
    if (!dateValue) {
      return;
    }

    const date: moment.Moment = moment(this.valueOfDate(dateValue));
    if (!this.timeEnable) date.startOf('day');
    this.dateValue = date.valueOf();
    this.selectedDate = date;
  }

  setViewDate(): void {
    if (!this.dateValue) {
      this.viewDate = this.dateMax ? moment(this.dateMax).endOf('jYear') : moment(this.today);
    } else {
      this.viewDate = this.dateMax && this.selectedDate.valueOf() > this.dateMax.valueOf() ?
        moment(this.dateMax) : moment(this.selectedDate);
    }
    if (!this.timeEnable) this.viewDate.startOf('day');
    this.onChangeViewDate();
  }

  onChangeViewDate(): void {
    this.viewDate.startOf('jMonth');
    this.setYears();
    this.setMonths();
    this.setDays();
    this.setViewDateTitle();
  }

  setYears(): void {
    this.years = [];
    const years: moment.Moment = moment(this.viewDate);
    years.startOf('jYear');
    years.add(-6, 'jYear');
    for (let i = 0 ; i < 12 ; i++) {
      const year: number[] = [years.valueOf(), years.jYear()];
      this.years.push({
        timestamp: year[0],
        value: year[1],
        isYearOfTodayDate: this.isYearOfTodayDate(year),
        isYearOfSelectedDate: this.isYearOfSelectedDate(year),
        isYearDisabled: this.isYearDisabled(year)
      });
      years.add(1, 'jYear');
    }
  }

  setMonths(): void {
    this.months = [];
    const months: moment.Moment = moment(this.viewDate);
    months.startOf('jYear');
    for (let i = 0 ; i < 12 ; i++) {
      const month: number[] = [months.valueOf(), months.jYear(), months.jMonth()];
      this.months.push({
        timestamp: month[0],
        year: month[1],
        indexValue: month[2],
        isMonthOfTodayDate: this.isMonthOfToday(month),
        isMonthOfSelectedDate: this.isMonthOfSelectedDate(month),
        isMonthDisabled: this.isMonthDisabled(month)
      });
      months.add(1, 'jMonth');
    }
  }

  setDays(): void {
    this.days = [];

    const prevMonthDetails: number[][] = [];
    const currentMonthDetails: number[][] = [];
    const nextMonthDetails: number[][] = [];

    const prevMonth: moment.Moment = moment(this.viewDate);
    const currentMonth: moment.Moment = moment(this.viewDate);
    const nextMonth: moment.Moment = moment(this.viewDate);

    prevMonth.add(-1, 'jMonth');
    nextMonth.add(1, 'jMonth');

    const currentMonthDays: number = moment.jDaysInMonth(currentMonth.jYear(), currentMonth.jMonth());
    const prevMonthDays: number = moment.jDaysInMonth(prevMonth.jYear(), prevMonth.jMonth());
    const nextMonthDays: number = moment.jDaysInMonth(nextMonth.jYear(), nextMonth.jMonth());

    for (let i = 0 ; i < prevMonthDays ; i++) {
      prevMonthDetails.push([prevMonth.valueOf(), prevMonth.jYear(), prevMonth.jMonth(), prevMonth.jDate()]);
      prevMonth.add(1, 'day');
    }
    for (let i = 0 ; i < currentMonthDays ; i++) {
      currentMonthDetails.push([currentMonth.valueOf(), currentMonth.jYear(), currentMonth.jMonth(), currentMonth.jDate()]);
      currentMonth.add(1, 'day');
    }
    for (let i = 0 ; i < nextMonthDays ; i++) {
      nextMonthDetails.push([nextMonth.valueOf(), nextMonth.jYear(), nextMonth.jMonth(), nextMonth.jDate()]);
      nextMonth.add(1, 'day');
    }

    for (let row = 0; row < 6 ; row++) {
      const rowValue: IDay[] = [];

      for (let col = 0; col < 7 ; col++) {
        const fromPrevMonth: number = (this.viewDate.day() === 6) ? 0 : (this.viewDate.day() + 1);
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
    const year: number = this.viewDate ? this.viewDate.jYear() : 0;
    if (!year) {
      return;
    }
    switch (this.viewModes[this.viewModeIndex]) {
      case 'day':
        this.viewDateTitle = this.viewDate.format('jMMMM') + ' ' + year.toString();
        break;
      case 'month':
        this.viewDateTitle = year.toString();
        break;
      case 'year':
        this.viewDateTitle = (year - 6).toString() + '-' + (year + 5).toString();
        break;
    }
  }

  setTime(date: moment.Moment | null = null): void {
    if (date) {
      this.hour = date.hour();
      this.minute = date.minute();
      this.second = date.second();
    } else if (this.selectedDate) {
      this.hour = this.selectedDate.hour();
      this.minute = this.selectedDate.minute();
      this.second = this.selectedDate.second();
    } else {
      this.hour = this.today.hour();
      this.minute = this.today.minute();
      this.second = this.today.second();
    }
  }

  setFormControlValue(): void {
    if (!this.formControl) {
      return;
    }

    if (this.dateValue) {
      this.formControl?.setValue(moment(this.dateValue).format(this.dateFormat));
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
      this.viewDate.add(skip, 'jYear');
    } else if (type === 2) {
      this.viewDate.add(skip, 'jMonth');
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
    this.viewDate = moment(year.timestamp);
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
    this.viewDate = moment(month.timestamp);
    this.viewModeIndex = this.viewModes.indexOf('day');
    this.onChangeViewDate();
  }

  dayClick(day: IDay): void {
    if (day.isDayDisabled) {
      return;
    }
    this.changeSelectedDate(moment(day.timestamp));
  }

  isYearOfTodayDate(year: number[]): boolean {
    return (
      this.today.jYear() === year[1]
    );
  }

  isYearOfSelectedDate(year: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      year[1] === this.selectedDate.jYear()
    );
  }

  isYearDisabled(month: number[]): boolean {
    return !this.isDateInRange(month[0], true, false);
  }

  isMonthOfToday(month: number[]): boolean {
    return (
      this.today.jYear() === month[1] &&
      this.today.jMonth() === month[2]
    );
  }

  isMonthOfSelectedDate(month: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      month[1] === this.selectedDate.jYear() &&
      month[2] === this.selectedDate.jMonth()
    );
  }

  isMonthDisabled(month: number[]): boolean {
    return !this.isDateInRange(month[0], false, true);
  }

  isDayInCurrentMonth(day: number[]): boolean {
    return (
      day[1] === this.viewDate.jYear() &&
      day[2] === this.viewDate.jMonth()
    );
  }

  isDayOfTodayDate(day: number[]): boolean {
    return (
      day[1] === this.today.jYear() &&
      day[2] === this.today.jMonth() &&
      day[3] === this.today.jDate()
    );
  }

  isDayOfSelectedDate(day: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      day[1] === this.selectedDate.jYear() &&
      day[2] === this.selectedDate.jMonth() &&
      day[3] === this.selectedDate.jDate()
    );
  }

  isDayDisabled(day: number[]): boolean {
    return !this.isDateInRange(day[0], false, false);
  }

  isDateInRange(date: number, isYear: boolean, isMonth: boolean): boolean {
    const result: boolean[] = [];
    if (this.dateMin) {
      const min: moment.Moment = moment(this.dateMin);
      if (isYear) {
        min.startOf('jYear');
      }
      if (isMonth) {
        min.startOf('jMonth');
      }
      result.push(min.valueOf() <= date);
    }
    if (this.dateMax) {
      const max: moment.Moment = moment(this.dateMax);
      if (isYear) {
        max.startOf('jYear');
      }
      if (isMonth) {
        max.startOf('jMonth');
      }
      result.push(max.valueOf() >= date);
    }
    return !(result.indexOf(false) !== -1);
  }

  changeSelectedDate(date: moment.Moment, setInputValue: boolean = true): void {
    this.selectedDate = moment(date);
    this.onChangeSelectedDate(setInputValue);
  }

  onChangeSelectedDate(setInputValue: boolean): void {
    if (this.timeEnable) {
      this.selectedDate.hour(this.hour);
      this.selectedDate.minute(this.minute);
      this.selectedDate.second(this.second);
      this.selectedDate.millisecond(0);
    } else {
      this.setToday();
      this.selectedDate.hour(this.today.hour());
      this.selectedDate.minute(this.today.minute());
      this.selectedDate.second(this.today.second());
      this.selectedDate.millisecond(this.today.millisecond());
    }
    this.dateValue = this.selectedDate.valueOf();
    if (this.uiHideAfterSelectDate && !this.preventClose) {
      this.setUiIsVisible(false);
    } else {
      this.preventClose = false;
    }
    if (setInputValue) {
      this.setFormControlValue();
    }
    this.setViewDate();
    this.dateOnSelect.next({
      shamsi: String(this.selectedDate.format(this.dateFormat)),
      gregorian: String(this.selectedDate.format(this.dateGregorianFormat)),
      timestamp: Number(this.selectedDate.valueOf())
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
    this.changeSelectedDate(this.selectedDate);
  }

  scrollIntoActiveTime(): void {
    if (!this.uiIsVisible || !this.timeEnable) {
      return;
    }

    setTimeout(() => {
      // Hour
      const activeHour = this.elementRef.nativeElement?.querySelector('.time-col.hour-col .dp-btn.selected');
      if (activeHour) activeHour.scrollIntoView({block: 'center'});
      // Minute
      const activeMinute = this.elementRef.nativeElement?.querySelector('.time-col.minute-col .dp-btn.selected');
      if (activeMinute) activeMinute.scrollIntoView({block: 'center'});
      // Second
      const activeSecond = this.elementRef.nativeElement?.querySelector('.time-col.second-col .dp-btn.selected');
      if (activeSecond) activeSecond.scrollIntoView({block: 'center'});
    }, 10);
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
      return (this.dateIsGregorian && !this.dateValue) ?
        moment(date, this.dateGregorianFormat).valueOf() :
        moment(date, this.dateFormat).valueOf();
    }

    return date;
  }

  private setUiIsVisible(value: boolean): void {
    this.uiIsVisible = value;
    this.uiIsVisibleChange.next(value);
    this.scrollIntoActiveTime();
  }

}
