import moment from 'moment-jalaali';
import { IActiveDate } from './interface/IActiveDate';
import { IYear } from './interface/IYear';
import { IMonth } from './interface/IMonth';
import { IDay } from './interface/IDay';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'ng-persian-datepicker',
  templateUrl: './ng-persian-datepicker.component.html',
  styleUrls: ['./ng-persian-datepicker.component.scss']
})
export class NgPersianDatepickerComponent implements OnInit, OnDestroy {

  constructor() {
    moment.loadPersian({
      usePersianDigits: false,
      dialect: 'persian-modern'
    });

    this.setToday();
    this.setWeekDays();
  }

  private _dateValue: number = 0;
  private preventClose: boolean = false;

  private uiYearView: boolean = true;
  private uiMonthView: boolean = true;

  private today!: moment.Moment;
  private selectedDate!: moment.Moment;
  private viewDate!: moment.Moment;

  private wasInsideClick: boolean = false;
  private inputEventFocusListener: any;
  private inputEventInputListener: any;

  id: string = 'ng-persian-datepicker-' + Math.random().toString(36).slice(2, 11);
  containerInlineStyle: object = {};
  weekDays: string[] = [];

  viewDateTitle: string = '';
  viewModes: string[] = [];
  viewModeIndex: number = 0;

  years: IYear[] = [];
  months: IMonth[] = [];
  days: IDay[][] = [];

  hour: number = 0;
  minute: number = 0;
  second: number = 0;

  /** @Input */

  @Input()
  input: HTMLInputElement | null = null;

  // date
  @Input()
  dateValue: string | number = '';

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
  }

  @Input()
  timeShowSecond: boolean = true;

  @Input()
  timeMeridian: boolean = false;

  // ui
  @Input()
  uiTheme: string = 'default';

  @Input()
  uiIsVisible: boolean = false;

  @Input()
  uiHideOnOutsideClick: boolean = true;

  @Input()
  uiHideAfterSelectDate: boolean = true;

  @Input()
  uiContainerWidth: string = '';

  @Input('uiYearView')
  set _uiYearView(value: boolean) {
    this.uiYearView = value;
    this.checkViewModes();
  }

  @Input('uiMonthView')
  set _uiMonthView(value: boolean) {
    this.uiMonthView = value;
    this.checkViewModes();
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

    this.setDateInitValue();

    this.setSelectedDate();
    this.setViewDate();

    this.setTime();

    this.setInputValue();
    this.setInputListener();
    this.setShowOnInputFocus();
  }

  ngOnDestroy(): void {
    if (this.input) {
      this.input.removeEventListener('focus', this.inputEventFocusListener);
      this.input.removeEventListener('input', this.inputEventInputListener);
    }
  }

  setToday(): void {
    this.today = moment();
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

  setDateInitValue(): void {
    if (this.dateValue || !this.dateInitValue) {
      return;
    }
    this._dateValue = this.today.valueOf();
    this.selectedDate = moment(this._dateValue);
    this.dateOnInit.next({
      shamsi: String(this.selectedDate.format(this.dateFormat)),
      gregorian: String(this.selectedDate.format(this.dateGregorianFormat)),
      timestamp: Number(this.selectedDate.valueOf())
    });
  }

  setSelectedDate(): void {
    if (!this.dateValue) {
      return;
    }

    if (typeof this.dateValue === 'string') {
      if (this.dateIsGregorian) {
        this._dateValue = moment(this.dateValue, this.dateGregorianFormat).valueOf();
      } else {
        this._dateValue = moment(this.dateValue, this.dateFormat).valueOf();
      }
    } else {
      this._dateValue = this.dateValue;
    }

    this.selectedDate = moment(this._dateValue);
  }

  setViewDate(): void {
    if (!this._dateValue) {
      this.viewDate = this.dateMax ? moment(this.dateMax).endOf('jYear') : moment(this.today);
    } else {
      this.viewDate = this.dateMax && this.selectedDate.valueOf() > this.dateMax.valueOf() ?
        moment(this.dateMax) : moment(this.selectedDate);
    }
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
    const year: number = this.viewDate.jYear();
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
      return;
    }
    if (this.selectedDate) {
      this.hour = this.selectedDate.hour();
      this.minute = this.selectedDate.minute();
      this.second = this.selectedDate.second();
      return;
    }
    this.hour = this.today?.hour() || 0;
    this.minute = this.today?.minute() || 0;
    this.second = this.today?.second() || 0;
  }

  setInputValue(): void {
    if (!this.input) {
      return;
    }
    if (this._dateValue) {
      this.input.value = moment(this._dateValue).format(this.dateFormat);
    }
  }

  setInputListener(): void {
    if (!this.input) {
      return;
    }
    this.inputEventInputListener = (event: Event) => {
      const input: HTMLInputElement = event.target as HTMLInputElement;
      const date: moment.Moment = moment(input.value, this.dateFormat);
      if (!date.isValid()) {
        return;
      }
      this.setTime(date);
      this.changeSelectedDate(date, false);
    };
    this.input.addEventListener('input', this.inputEventInputListener);
  }

  setShowOnInputFocus(): void {
    if (!this.input) {
      return;
    }
    this.input.setAttribute('data-datepicker-id', this.id);
    this.inputEventFocusListener = () => this.setUiIsVisible(true);
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
      this.setViewDateTitle();
      return;
    }
    this.viewModeIndex++;
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
    } else {
      this.setToday();
      this.selectedDate.hour(this.today.hour());
      this.selectedDate.minute(this.today.minute());
      this.selectedDate.second(this.today.second());
    }
    this._dateValue = this.selectedDate.valueOf();
    if (this.uiHideAfterSelectDate && !this.preventClose) {
      this.setUiIsVisible(false);
    } else {
      this.preventClose = false;
    }
    if (setInputValue) {
      this.setInputValue();
    }
    this.setViewDate();
    this.dateOnSelect.next({
      shamsi: String(this.selectedDate.format(this.dateFormat)),
      gregorian: String(this.selectedDate.format(this.dateGregorianFormat)),
      timestamp: Number(this.selectedDate.valueOf())
    });
  }

  increaseHour(): void {
    if ((this.hour + 1) === 24) {
      this.hour = 0;
    } else {
      this.hour++;
    }
    this.onTimeChange();
  }

  decreaseHour(): void {
    if ((this.hour - 1) === -1) {
      this.hour = 23;
    } else {
      this.hour--;
    }
    this.onTimeChange();
  }

  increaseMinute(): void {
    if ((this.minute + 1) === 60) {
      this.minute = 0;
    } else {
      this.minute++;
    }
    this.onTimeChange();
  }

  decreaseMinute(): void {
    if ((this.minute - 1) === -1) {
      this.minute = 59;
    } else {
      this.minute--;
    }
    this.onTimeChange();
  }

  increaseSecond(): void {
    if ((this.second + 1) === 60) {
      this.second = 0;
    } else {
      this.second++;
    }
    this.onTimeChange();
  }

  decreaseSecond(): void {
    if ((this.second - 1) === -1) {
      this.second = 59;
    } else {
      this.second--;
    }
    this.onTimeChange();
  }

  toggleAmPm(): void {
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

  @HostListener('click')
  onInsideClick(): void {
    this.wasInsideClick = true;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: any): void {
    const wasInsideClick: boolean = this.wasInsideClick;
    this.wasInsideClick = false;
    if (wasInsideClick) {
      return;
    }
    if (
      !this.uiHideOnOutsideClick ||
      (this.input && (event.target.getAttribute('data-datepicker-id') === this.id))
    ) {
      return;
    }
    this.setUiIsVisible(false);
  }

  private setUiIsVisible(value: boolean): void {
    this.uiIsVisible = value;
    this.uiIsVisibleChange.next(value);
  }

}
