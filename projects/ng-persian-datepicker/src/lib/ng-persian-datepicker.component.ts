import moment from 'moment-jalaali';
import { ConfigModel } from './model/config.model';
import { InitConfig } from './config/init.config';
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

  private preventClose: boolean;
  private weekDays: Array<string>;
  //
  private viewModes: Array<string> = ['day'];
  private currentViewMode = 0;
  //
  private today: moment.Moment;
  private selectedDate: moment.Moment;
  private viewDate: moment.Moment;
  private years: Array<moment.Moment> = [];
  private months: Array<moment.Moment> = [];
  private prevMonthDays: Array<moment.Moment> = [];
  private currentMonthDays: Array<moment.Moment> = [];
  private nextMonthDays: Array<moment.Moment> = [];
  //
  private hour = 0;
  private minute = 0;
  private second = 0;
  //
  private fastTimeChangeInterval = 123;
  private increaseHourInterval: any;
  private decreaseHourInterval: any;
  private increaseMinuteInterval: any;
  private decreaseMinuteInterval: any;
  private increaseSecondInterval: any;
  private decreaseSecondInterval: any;
  //
  private documentEventClickListener: any;
  private inputEventClickListener: any;
  private inputEventInputListener: any;
  //
  private inputClientRect: ClientRect;
  private afterContentInitDone = false;
  //
  @Input() input: HTMLInputElement;
  @Input() config: ConfigModel = {};
  //
  @ViewChild('container', {static: false}) container: ElementRef;

  ngOnInit(): void {
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
    this.setConfig();
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
    this.setShowOnInputClick();
    //
    this.setHideOnOutSideClick();
    this.afterContentInitDone = true;
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.documentEventClickListener);
    this.input.removeEventListener('click', this.inputEventClickListener);
    this.input.removeEventListener('input', this.inputEventInputListener);
  }

  setConfig(): void {
    for (const key in InitConfig) {
      if (InitConfig.hasOwnProperty(key)) {
        this.config[key] = Object.assign(InitConfig[key], this.config[key]);
      }
    }
  }

  @HostListener('window:resize')
  calcInputClientRect() {
    if (this.input) {
      this.inputClientRect = this.input.getBoundingClientRect();
    }
  }

  containerStyle(): object {
    if (!this.config.ui.autoPosition) {
      return {};
    }
    const containerWidth = {
      width: '200px'
    };
    const containerPosition = {
      position: 'absolute',
      top: String(this.config.ui.positionOffset[0]) + 'px',
      left: String(this.config.ui.positionOffset[0]) + 'px',
    };
    if (this.config.ui.containerWidth) {
      containerWidth.width = this.config.ui.containerWidth;
    } else if (this.input) {
      containerWidth.width = String(this.inputClientRect.width) + 'px';
      containerPosition.top = String(this.inputClientRect.top + this.inputClientRect.height + this.config.ui.positionOffset[0]) + 'px';
      containerPosition.left = String(this.inputClientRect.left + this.config.ui.positionOffset[1]) + 'px';
    }
    return Object.assign(containerWidth, containerPosition);
  }

  setDateInitValue(): void {
    if (this.config.date.value || !this.config.date.initValue) {
      return;
    }
    this.config.date.value = this.today.format(this.config.date.format);
  }

  setSelectedDate(): void {
    if (!this.config.date.value) {
      return;
    }
    if (this.config.date.isGregorian) {
      this.config.date.value = moment(this.config.date.value, this.config.date.gregorianFormat).format(this.config.date.format);
    }
    this.selectedDate = moment(this.config.date.value, this.config.date.format);
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
    if (!this.config.date.value) {
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
      this.years.push(moment(years));
      years.add(1, 'jYear');
    }
    for (let i = 0 ; i < 12 ; i++) {
      this.months.push(moment(months));
      months.add(1, 'jMonth');
    }
    for (let i = 0 ; i < prevMonthDays ; i++) {
      this.prevMonthDays.push(moment(prevMonth));
      prevMonth.add(1, 'day');
    }
    for (let i = 0 ; i < currentMonthDays ; i++) {
      this.currentMonthDays.push(moment(currentMonth));
      currentMonth.add(1, 'day');
    }
    for (let i = 0 ; i < nextMonthDays ; i++) {
      this.nextMonthDays.push(moment(nextMonth));
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

  getYears(): Array<moment.Moment> {
    return this.years;
  }

  getMonths(): Array<moment.Moment> {
    return this.months;
  }

  isViewMode(mode: string): boolean {
    return this.viewModes[this.currentViewMode] === mode;
  }

  setInputValue(): void {
    if (!this.input) {
      return;
    }
    this.input.value = this.config.date.value;
  }

  lockInputValue(): void {
    if (!this.input) {
      return;
    }
    this.inputEventInputListener = () => {
      this.input.value = this.config.date.value;
    };
    this.input.addEventListener('input', this.inputEventInputListener);
  }

  setShowOnInputClick(): void {
    if (!this.input) {
      return;
    }
    this.inputEventClickListener = () => {
      this.config.ui.isVisible = true;
    };
    this.input.addEventListener('click', this.inputEventClickListener);
  }

  setHideOnOutSideClick(): void {
    this.documentEventClickListener = (event) => {
      if (
        !this.config.ui.hideOnOutSideClick ||
        (this.input && (event.target === this.input)) ||
        this.container.nativeElement.attributes[0].name === event.target.attributes[0].name
      ) {
        return;
      }
      this.config.ui.isVisible = false;
    };
    document.addEventListener('click', this.documentEventClickListener);
  }

  checkViewModes(): void {
    let viewModesCount = 1;
    if (this.config.ui.yearView) {
      viewModesCount++;
    }
    if (this.config.ui.monthView) {
      viewModesCount++;
    }
    if (viewModesCount !== this.viewModes.length) {
      this.setViewModes();
    }
  }

  setViewModes(): void {
    this.viewModes = ['day'];
    if (this.config.ui.monthView) {
      this.viewModes.push('month');
    }
    if (this.config.ui.yearView) {
      this.viewModes.push('year');
    }
    if (this.viewModes.length <= this.currentViewMode) {
      this.currentViewMode = 0;
    }
  }

  getDayOfMonth(row: number, col: number): moment.Moment {
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
    return !this.isDateInRange(day, false, false);
  }

  isDayOfToday(row: number, col: number): boolean {
    const day = this.getDayOfMonth(row, col);
    return (
      day.jYear() === this.today.jYear() &&
      day.jMonth() === this.today.jMonth() &&
      day.jDate() === this.today.jDate()
    );
  }

  isInCurrentMonth(row: number, col: number): boolean {
    const day = this.getDayOfMonth(row, col);
    return (
      day.jYear() === this.viewDate.jYear() &&
      day.jMonth() === this.viewDate.jMonth()
    );
  }

  isDayOfSelectedDate(row: number, col: number): boolean {
    if (!this.selectedDate) {
      return false;
    }
    const day = this.getDayOfMonth(row, col);
    return (
      day.jYear() === this.selectedDate.jYear() &&
      day.jMonth() === this.selectedDate.jMonth() &&
      day.jDate() === this.selectedDate.jDate()
    );
  }

  isMonthOfSelectedDate(month: moment.Moment): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      month.jYear() === this.selectedDate.jYear() &&
      month.jMonth() === this.selectedDate.jMonth()
    );
  }

  isYearOfSelectedDate(month: moment.Moment): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      month.jYear() === this.selectedDate.jYear()
    );
  }

  changeDate(row: number, col: number): void {
    const date = this.getDayOfMonth(row, col);
    if (!this.isDateInRange(date, false, false)) {
      return;
    }
    this.changeSelectedDate(date);
  }

  changeSelectedDate(date: moment.Moment): void {
    this.selectedDate = moment(date);
    this.onChangeSelectedDate();
  }

  onChangeSelectedDate(): void {
    if (this.config.time.enable) {
      this.selectedDate.hour(this.hour);
      this.selectedDate.minute(this.minute);
      this.selectedDate.second(this.second);
    } else {
      this.setToday();
      this.selectedDate.hour(this.today.hour());
      this.selectedDate.minute(this.today.minute());
      this.selectedDate.second(this.today.second());
    }
    this.config.date.value = this.selectedDate.format(this.config.date.format);
    if (this.input) {
      this.input.value = this.config.date.value;
    }
    if (this.config.ui.hideAfterSelectDate && !this.preventClose) {
      this.config.ui.isVisible = false;
    } else {
      this.preventClose = false;
    }
    this.setViewDate();
    this.config.date.onSelect(
      String(this.selectedDate.format(this.config.date.format)),
      String(this.selectedDate.format(this.config.date.gregorianFormat)),
      moment(this.selectedDate)
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

  yearClick(date: moment.Moment): void {
    if (!this.isDateInRange(date, true, false)) {
      return;
    }
    this.viewDate = moment(date);
    this.onChangeViewDate();
    let viewModeIndex = this.viewModes.indexOf('month');
    if (viewModeIndex === -1) {
      viewModeIndex = this.viewModes.indexOf('day');
    }
    this.currentViewMode = viewModeIndex;
  }

  monthClick(date: moment.Moment): void {
    if (!this.isDateInRange(date, false, true)) {
      return;
    }
    this.viewDate = moment(date);
    this.onChangeViewDate();
    this.currentViewMode = this.viewModes.indexOf('day');
  }

  isTheme(name: string): boolean {
    return this.config.ui.theme === name;
  }

  isYearOfToday(year: moment.Moment): boolean {
    return (
      this.today.jYear() === year.jYear()
    );
  }

  isMonthOfToday(month: moment.Moment): boolean {
    return (
      this.today.jYear() === month.jYear() &&
      this.today.jMonth() === month.jMonth()
    );
  }

  getHourText(): string {
    const hour = this.hour;
    if (!this.config.time.meridian) {
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
    this.increaseHourInterval = setInterval(() => {
      this.increaseHour();
    }, this.fastTimeChangeInterval);
  }

  clearIncreaseHourInterval(): void {
    clearInterval(this.increaseHourInterval);
  }

  setDecreaseHourInterval(): void {
    this.decreaseHourInterval = setInterval(() => {
      this.decreaseHour();
    }, this.fastTimeChangeInterval);
  }

  clearDecreaseHourInterval(): void {
    clearInterval(this.decreaseHourInterval);
  }

  setIncreaseMinuteInterval(): void {
    this.increaseMinuteInterval = setInterval(() => {
      this.increaseMinute();
    }, this.fastTimeChangeInterval);
  }

  clearIncreaseMinuteInterval(): void {
    clearInterval(this.increaseMinuteInterval);
  }

  setDecreaseMinuteInterval(): void {
    this.decreaseMinuteInterval = setInterval(() => {
      this.decreaseMinute();
    }, this.fastTimeChangeInterval);
  }

  clearDecreaseMinuteInterval(): void {
    clearInterval(this.decreaseMinuteInterval);
  }

  setIncreaseSecondInterval(): void {
    this.increaseSecondInterval = setInterval(() => {
      this.increaseSecond();
    }, this.fastTimeChangeInterval);
  }

  clearIncreaseSecondInterval(): void {
    clearInterval(this.increaseSecondInterval);
  }

  setDecreaseSecondInterval(): void {
    this.decreaseSecondInterval = setInterval(() => {
      this.decreaseSecond();
    }, this.fastTimeChangeInterval);
  }

  clearDecreaseSecondInterval(): void {
    clearInterval(this.decreaseSecondInterval);
  }

  isDateInRange(date: moment.Moment, isYear: boolean, isMonth: boolean): boolean {
    const result: Array<boolean> = [];
    const min = moment(this.config.date.min);
    const max = moment(this.config.date.max);
    if (isYear) {
      min.startOf('jYear');
      max.startOf('jYear');
    }
    if (isMonth) {
      min.startOf('jMonth');
      max.startOf('jMonth');
    }
    if (this.config.date.min) {
      result.push(min.valueOf() <= date.valueOf());
    }
    if (this.config.date.max) {
      result.push(max.valueOf() >= date.valueOf());
    }
    return !(result.indexOf(false) !== -1);
  }

}
