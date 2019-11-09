import moment from 'moment-jalaali';
import {
  AfterContentInit,
  Component,
  DoCheck,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'ng-persian-datepicker',
  templateUrl: './ng-persian-datepicker.component.html',
  styleUrls: ['./ng-persian-datepicker.component.scss']
})
export class NgPersianDatepickerComponent implements OnInit, AfterContentInit, DoCheck, OnDestroy {

  constructor(
  ) {}

  private id: string;
  //
  private preventClose: boolean;
  private weekDays: Array<string>;
  //
  private viewModes: Array<string> = ['day'];
  private currentViewMode = 0;
  //
  private today: moment.Moment;
  private selectedDate: moment.Moment;
  private viewDate: moment.Moment;
  private years: Array<Array<number>> = [];
  private months: Array<Array<number>> = [];
  private prevMonthDays: Array<Array<number>> = [];
  private currentMonthDays: Array<Array<number>> = [];
  private nextMonthDays: Array<Array<number>> = [];
  //
  private hour = 0;
  private minute = 0;
  private second = 0;
  //
  private fastTimeChangeTimeOut = 345;
  private fastTimeChangeInterval = 123;
  //
  private increaseHourTimeout: any;
  private increaseHourInterval: any;
  //
  private decreaseHourTimeout: any;
  private decreaseHourInterval: any;
  //
  private increaseMinuteTimeout: any;
  private increaseMinuteInterval: any;
  //
  private decreaseMinuteTimeout: any;
  private decreaseMinuteInterval: any;
  //
  private increaseSecondTimeout: any;
  private increaseSecondInterval: any;
  //
  private decreaseSecondTimeout: any;
  private decreaseSecondInterval: any;
  //
  private wasInsideClick = false;
  private inputEventFocusListener: any;
  private inputEventInputListener: any;
  //
  private afterContentInitDone = false;
  //
  private inputClientRect: ClientRect = null;
  @Input() input: HTMLInputElement = null;
  // date
  @Input() dateValue: string | number = '';
  @Input() dateInitValue = true;
  @Input() dateIsGregorian = false;
  @Input() dateFormat = 'jYYYY-jMM-jDD HH:mm:ss';
  @Input() dateGregorianFormat = 'YYYY-MM-DD HH:mm:ss';
  @Input() dateMin: number = null;
  @Input() dateMax: number = null;
  @Input() dateOnSelect: (shamsiDate: string, gregorianDate: string, timestamp: number) => void = () => {};
  // time
  @Input() timeEnable = true;
  @Input() timeShowSecond = true;
  @Input() timeMeridian = false;
  // ui
  @Input() uiTheme = 'default';
  @Input() uiIsVisible = false;
  @Input() uiHideOnOutSideClick = true;
  @Input() uiHideAfterSelectDate = true;
  @Input() uiYearView = true;
  @Input() uiMonthView = true;
  @Input() uiAutoPosition = false;
  @Input() uiPositionOffset: Array<number> = [0, 0];
  @Input() uiContainerWidth = '';
  //
  @ViewChild('container', {static: false}) container: ElementRef;

  ngOnInit(): void {
    this.setId();
    moment.loadPersian({
      usePersianDigits: false,
      dialect: 'persian-modern'
    });
    this.setWeekDays();
  }

  ngDoCheck(): void {
    if (!this.afterContentInitDone) {
      return;
    }
    this.checkViewModes();
  }

  ngAfterContentInit(): void {
    this.setViewModes();
    this.calcInputClientRect();
    //
    this.setToday();
    this.setDateInitValue();
    //
    this.setSelectedDate();
    this.setTime();
    this.setViewDate();
    //
    this.setInputValue();
    this.lockInputValue();
    this.setShowOnInputFocus();
    //
    this.afterContentInitDone = true;
  }

  ngOnDestroy(): void {
    this.input.removeEventListener('focus', this.inputEventFocusListener);
    this.input.removeEventListener('input', this.inputEventInputListener);
  }

  setId(): void {
    this.id = 'ng-persian-datepicker-' + Math.random().toString(36).substr(2, 9);
  }

  getId(): string {
    return this.id;
  }

  @HostListener('window:resize')
  calcInputClientRect() {
    if (this.input) {
      this.inputClientRect = this.input.getBoundingClientRect();
    }
  }

  containerStyle(): object {
    if (!this.uiAutoPosition) {
      return {};
    }
    const containerWidth = {
      width: '200px'
    };
    const containerPosition = {
      position: 'absolute',
      top: String(this.uiPositionOffset[0]) + 'px',
      left: String(this.uiPositionOffset[0]) + 'px',
    };
    if (this.input && this.inputClientRect) {
      containerWidth.width = String(this.inputClientRect.width) + 'px';
      containerPosition.top = String(this.inputClientRect.top + this.inputClientRect.height + this.uiPositionOffset[0]) + 'px';
      containerPosition.left = String(this.inputClientRect.left + this.uiPositionOffset[1]) + 'px';
    }
    if (this.uiContainerWidth) {
      containerWidth.width = this.uiContainerWidth;
    }
    return Object.assign(containerWidth, containerPosition);
  }

  setDateInitValue(): void {
    if (this.dateValue || !this.dateInitValue) {
      return;
    }
    this.dateValue = this.today.valueOf();
  }

  setSelectedDate(): void {
    if (!this.dateValue) {
      return;
    }
    if (typeof this.dateValue === 'string') {
      if (this.dateIsGregorian) {
        this.dateValue = moment((this.dateValue as string), this.dateGregorianFormat).valueOf();
      } else {
        this.dateValue = moment((this.dateValue as string), this.dateFormat).valueOf();
      }
    }
    this.selectedDate = moment((this.dateValue as number));
  }

  setTime(): void {
    if (this.selectedDate) {
      this.hour = this.selectedDate.hour();
      this.minute = this.selectedDate.minute();
      this.second = this.selectedDate.second();
      return;
    }
    this.hour = this.today.hour();
    this.minute = this.today.minute();
    this.second = this.today.second();
  }

  setViewDate(): void {
    if (!this.dateValue) {
      this.viewDate = moment(this.today);
    } else {
      this.viewDate = moment(this.selectedDate);
    }
    this.onChangeViewDate();
  }

  onChangeViewDate(): void {
    this.viewDate.startOf('jMonth');
    this.years = [];
    this.months = [];
    this.currentMonthDays = [];
    this.prevMonthDays = [];
    this.nextMonthDays = [];
    const years = moment(this.viewDate);
    const months = moment(this.viewDate);
    const prevMonth = moment(this.viewDate);
    const currentMonth = moment(this.viewDate);
    const nextMonth = moment(this.viewDate);
    years.startOf('jYear');
    years.add(-6, 'jYear');
    months.startOf('jYear');
    prevMonth.add(-1, 'jMonth');
    nextMonth.add(1, 'jMonth');
    const currentMonthDays = moment.jDaysInMonth(currentMonth.jYear(), currentMonth.jMonth());
    const prevMonthDays = moment.jDaysInMonth(prevMonth.jYear(), prevMonth.jMonth());
    const nextMonthDays = moment.jDaysInMonth(nextMonth.jYear(), nextMonth.jMonth());
    for (let i = 0 ; i < 12 ; i++) {
      this.years.push([years.valueOf(), years.jYear()]);
      years.add(1, 'jYear');
    }
    for (let i = 0 ; i < 12 ; i++) {
      this.months.push([months.valueOf(), months.jYear(), months.jMonth()]);
      months.add(1, 'jMonth');
    }
    for (let i = 0 ; i < prevMonthDays ; i++) {
      this.prevMonthDays.push([prevMonth.valueOf(), prevMonth.jYear(), prevMonth.jMonth(), prevMonth.jDate()]);
      prevMonth.add(1, 'day');
    }
    for (let i = 0 ; i < currentMonthDays ; i++) {
      this.currentMonthDays.push([currentMonth.valueOf(), currentMonth.jYear(), currentMonth.jMonth(), currentMonth.jDate()]);
      currentMonth.add(1, 'day');
    }
    for (let i = 0 ; i < nextMonthDays ; i++) {
      this.nextMonthDays.push([nextMonth.valueOf(), nextMonth.jYear(), nextMonth.jMonth(), nextMonth.jDate()]);
      nextMonth.add(1, 'day');
    }
  }

  setToday(): void {
    this.today = moment();
  }

  setWeekDays(): void {
    this.weekDays = moment.weekdaysMin();
    this.weekDays.unshift(this.weekDays.pop());
  }

  getWeekDays(): Array<string> {
    return this.weekDays;
  }

  getYears(): Array<Array<number>> {
    return this.years;
  }

  getMonths(): Array<Array<number>> {
    return this.months;
  }

  isViewMode(mode: string): boolean {
    return this.viewModes[this.currentViewMode] === mode;
  }

  setInputValue(): void {
    if (!this.input) {
      return;
    }
    this.input.value = moment((this.dateValue as number)).format(this.dateFormat);
  }

  lockInputValue(): void {
    if (!this.input) {
      return;
    }
    this.inputEventInputListener = () => {
      this.setInputValue();
    };
    this.input.addEventListener('input', this.inputEventInputListener);
  }

  setShowOnInputFocus(): void {
    if (!this.input) {
      return;
    }
    this.input.setAttribute('data-datepicker-id', this.id);
    this.inputEventFocusListener = () => {
      this.calcInputClientRect();
      this.uiIsVisible = true;
    };
    this.input.addEventListener('focus', this.inputEventFocusListener);
  }

  @HostListener('click')
  onInsideClick(): void {
    this.wasInsideClick = true;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: any): void {
    const wasInsideClick = this.wasInsideClick;
    this.wasInsideClick = false;
    if (wasInsideClick) {
      return;
    }
    if (
      !this.uiHideOnOutSideClick ||
      (this.input && (event.target.getAttribute('data-datepicker-id') === this.id))
    ) {
      return;
    }
    this.uiIsVisible = false;
  }

  checkViewModes(): void {
    let viewModesCount = 1;
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

  setViewModes(): void {
    this.viewModes = ['day'];
    if (this.uiMonthView) {
      this.viewModes.push('month');
    }
    if (this.uiYearView) {
      this.viewModes.push('year');
    }
    if (this.viewModes.length <= this.currentViewMode) {
      this.currentViewMode = 0;
    }
  }

  getDayOfMonth(row: number, col: number): Array<number> {
    const fromPrevMonth = (this.viewDate.day() === 6) ? 0 : (this.viewDate.day() + 1);
    let index = ((row * 7) + col) - fromPrevMonth;
    if (index < 0) {
      index = this.prevMonthDays.length - (fromPrevMonth - col);
      return this.prevMonthDays[index];
    } else if (index >= this.currentMonthDays.length) {
      index = index - this.currentMonthDays.length;
      return this.nextMonthDays[index];
    }
    return this.currentMonthDays[index];
  }

  isDayDisabled(row: number, col: number): boolean {
    const day = this.getDayOfMonth(row, col);
    return !this.isDateInRange(day[0], false, false);
  }

  isDayOfToday(row: number, col: number): boolean {
    const day = this.getDayOfMonth(row, col);
    return (
      day[1] === this.today.jYear() &&
      day[2] === this.today.jMonth() &&
      day[3] === this.today.jDate()
    );
  }

  isInCurrentMonth(row: number, col: number): boolean {
    const day = this.getDayOfMonth(row, col);
    return (
      day[1] === this.viewDate.jYear() &&
      day[2] === this.viewDate.jMonth()
    );
  }

  isDayOfSelectedDate(row: number, col: number): boolean {
    if (!this.selectedDate) {
      return false;
    }
    const day = this.getDayOfMonth(row, col);
    return (
      day[1] === this.selectedDate.jYear() &&
      day[2] === this.selectedDate.jMonth() &&
      day[3] === this.selectedDate.jDate()
    );
  }

  isMonthOfSelectedDate(month: Array<number>): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      month[1] === this.selectedDate.jYear() &&
      month[2] === this.selectedDate.jMonth()
    );
  }

  isYearOfSelectedDate(year: Array<number>): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      year[1] === this.selectedDate.jYear()
    );
  }

  changeDate(row: number, col: number): void {
    const day = this.getDayOfMonth(row, col);
    if (!this.isDateInRange(day[0], false, false)) {
      return;
    }
    this.changeSelectedDate(moment(day[0]));
  }

  changeSelectedDate(date: moment.Moment): void {
    this.selectedDate = moment(date);
    this.onChangeSelectedDate();
  }

  onChangeSelectedDate(): void {
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
    this.dateValue = this.selectedDate.valueOf();
    this.setInputValue();
    if (this.uiHideAfterSelectDate && !this.preventClose) {
      this.uiIsVisible = false;
    } else {
      this.preventClose = false;
    }
    this.setViewDate();
    this.dateOnSelect(
      String(this.selectedDate.format(this.dateFormat)),
      String(this.selectedDate.format(this.dateGregorianFormat)),
      Number(this.selectedDate.valueOf())
    );
  }

  skipViewDate(skip: number, type: number): void {
    if (type === 1) {
      this.viewDate.add(skip, 'jYear');
    } else if (type === 2) {
      this.viewDate.add(skip, 'jMonth');
    }
  }

  navigate(forward: boolean = true): void {
    let skip = 1;
    if (!forward) {
      skip = skip * -1;
    }
    switch (this.viewModes[this.currentViewMode]) {
      case 'day':
        this.skipViewDate(skip, 2);
        this.onChangeViewDate();
        break;
      case 'month':
        this.skipViewDate(skip, 1);
        this.onChangeViewDate();
        break;
      case 'year':
        this.skipViewDate((skip * 12), 1);
        this.onChangeViewDate();
        break;
    }
  }

  getViewDateTitle(): string {
    const year = this.viewDate.jYear();
    switch (this.viewModes[this.currentViewMode]) {
      case 'day':
        return this.viewDate.format('jMMMM') + ' ' + year.toString();
      case 'month':
        return year.toString();
      case 'year':
        return (year - 6).toString() + '-' + (year + 5).toString();
      default:
        return '';
    }
  }

  selectToday(): void {
    this.setToday();
    this.preventClose = true;
    this.changeSelectedDate(this.today);
  }

  nextViewMode(): void {
    if (this.viewModes.length === 1) {
      return;
    }
    if (this.viewModes.length <= (this.currentViewMode + 1)) {
      this.currentViewMode = 0;
      return;
    }
    this.currentViewMode++;
  }

  yearClick(year: Array<number>): void {
    if (!this.isDateInRange(year[0], true, false)) {
      return;
    }
    this.viewDate = moment(year[0]);
    this.onChangeViewDate();
    let viewModeIndex = this.viewModes.indexOf('month');
    if (viewModeIndex === -1) {
      viewModeIndex = this.viewModes.indexOf('day');
    }
    this.currentViewMode = viewModeIndex;
  }

  monthClick(month: Array<number>): void {
    if (!this.isDateInRange(month[0], false, true)) {
      return;
    }
    this.viewDate = moment(month[0]);
    this.onChangeViewDate();
    this.currentViewMode = this.viewModes.indexOf('day');
  }

  isTheme(name: string): boolean {
    return this.uiTheme === name;
  }

  isYearOfToday(year: Array<number>): boolean {
    return (
      this.today.jYear() === year[1]
    );
  }

  isMonthOfToday(month: Array<number>): boolean {
    return (
      this.today.jYear() === month[1] &&
      this.today.jMonth() === month[2]
    );
  }

  getHourText(): string {
    const hour = this.hour;
    if (!this.timeMeridian) {
      return hour.toString().padStart(2, '0');
    }
    if (hour === 0) {
      return (12).toString().padStart(2, '0');
    }
    if (hour > 12) {
      return (hour - 12).toString().padStart(2, '0');
    }
    return hour.toString().padStart(2, '0');
  }

  getMinuteText(): string {
    return this.minute.toString().padStart(2, '0');
  }

  getSecondText(): string {
    return this.second.toString().padStart(2, '0');
  }

  getAmPmText(): string {
    if (this.hour >= 12) {
      return 'PM';
    }
    return 'AM';
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

  setIncreaseHourInterval(): void {
    this.increaseHourTimeout = setTimeout(() => {
      this.increaseHourInterval = setInterval(() => {
        this.increaseHour();
      }, this.fastTimeChangeInterval);
    }, this.fastTimeChangeTimeOut);
  }

  clearIncreaseHourInterval(): void {
    clearTimeout(this.increaseHourTimeout);
    clearInterval(this.increaseHourInterval);
  }

  setDecreaseHourInterval(): void {
    this.decreaseHourTimeout = setTimeout(() => {
      this.decreaseHourInterval = setInterval(() => {
        this.decreaseHour();
      }, this.fastTimeChangeInterval);
    }, this.fastTimeChangeTimeOut);
  }

  clearDecreaseHourInterval(): void {
    clearTimeout(this.decreaseHourTimeout);
    clearInterval(this.decreaseHourInterval);
  }

  setIncreaseMinuteInterval(): void {
    this.increaseMinuteTimeout = setTimeout(() => {
      this.increaseMinuteInterval = setInterval(() => {
        this.increaseMinute();
      }, this.fastTimeChangeInterval);
    }, this.fastTimeChangeTimeOut);
  }

  clearIncreaseMinuteInterval(): void {
    clearTimeout(this.increaseMinuteTimeout);
    clearInterval(this.increaseMinuteInterval);
  }

  setDecreaseMinuteInterval(): void {
    this.decreaseMinuteTimeout = setTimeout(() => {
      this.decreaseMinuteInterval = setInterval(() => {
        this.decreaseMinute();
      }, this.fastTimeChangeInterval);
    }, this.fastTimeChangeTimeOut);
  }

  clearDecreaseMinuteInterval(): void {
    clearTimeout(this.decreaseMinuteTimeout);
    clearInterval(this.decreaseMinuteInterval);
  }

  setIncreaseSecondInterval(): void {
    this.increaseSecondTimeout = setTimeout(() => {
      this.increaseSecondInterval = setInterval(() => {
        this.increaseSecond();
      }, this.fastTimeChangeInterval);
    }, this.fastTimeChangeTimeOut);
  }

  clearIncreaseSecondInterval(): void {
    clearTimeout(this.increaseSecondTimeout);
    clearInterval(this.increaseSecondInterval);
  }

  setDecreaseSecondInterval(): void {
    this.decreaseSecondTimeout = setTimeout(() => {
      this.decreaseSecondInterval = setInterval(() => {
        this.decreaseSecond();
      }, this.fastTimeChangeInterval);
    }, this.fastTimeChangeTimeOut);
  }

  clearDecreaseSecondInterval(): void {
    clearTimeout(this.decreaseSecondTimeout);
    clearInterval(this.decreaseSecondInterval);
  }

  isDateInRange(date: number, isYear: boolean, isMonth: boolean): boolean {
    const result: Array<boolean> = [];
    if (this.dateMin) {
      const min = moment(this.dateMin);
      if (isYear) {
        min.startOf('jYear');
      }
      if (isMonth) {
        min.startOf('jMonth');
      }
      result.push(min.valueOf() <= date);
    }
    if (this.dateMax) {
      const max = moment(this.dateMax);
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

}
