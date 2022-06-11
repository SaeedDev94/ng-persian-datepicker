import { Jalali } from 'jalali-ts';
import { Subscription } from 'rxjs';
import { defaultTheme } from './theme';
import { weekDays, months } from './pipe/locale';
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

  private formControl?: FormControl;
  private formControlValueChanges?: Subscription;

  private dateValue: number = 0;
  private preventClose: boolean = false;

  private uiYearView: boolean = true;
  private uiMonthView: boolean = true;

  private today!: Jalali;
  private selectedDate!: Jalali;
  private viewDate!: Jalali;

  private wasInsideClick: boolean = false;

  viewDateTitle: string = '';
  viewModes: string[] = [];
  viewModeIndex: number = 0;

  weekDays: string[] = weekDays;

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

  dateFormat: string = 'YYYY/MM/DD';
  @Input('dateFormat')
  set _dateFormat(value: string) {
    this.dateFormat = value.replace(new RegExp('j', 'g'), '');
  }

  @Input()
  dateGregorianFormat: string = 'YYYY-MM-DD';

  @Input()
  dateMin: number | null = null;

  @Input()
  dateMax: number | null = null;

  // time
  timeEnable: boolean = false;
  @Input('timeEnable')
  set _timeEnable(value: boolean) {
    this.timeEnable = value;
    this.setTime();
    this.scrollIntoActiveTime();
  }

  timeShowSecond: boolean = false;
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
          let valueOf: number = 0;
          if (value) {
            try {
              valueOf = this.valueOfDate(value);
            } catch (e) {
              return;
            }
          }
          if (!value || valueOf === this.dateValue) return;

          const date = Jalali.timestamp(valueOf);
          if (!this.isDateInRange(date.valueOf(), false, false)) {
            return;
          }

          this.setTime(date);
          this.changeSelectedDate(date, false);
          this.scrollIntoActiveTime();
        }
      });
  }

  setToday(): void {
    const today = new Jalali();
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

  setDateInitValue(dateValue: string | number): void {
    if (dateValue || !this.dateInitValue) {
      return;
    }
    this.dateValue = this.today.valueOf();
    this.selectedDate = Jalali.timestamp(this.dateValue);
    this.dateOnInit.next({
      shamsi: String(this.selectedDate.format(this.dateFormat)),
      gregorian: String(this.selectedDate.format(this.dateGregorianFormat, true)),
      timestamp: Number(this.selectedDate.valueOf())
    });
  }

  setSelectedDate(dateValue: string | number): void {
    if (!dateValue) {
      return;
    }

    const date = Jalali.timestamp(this.valueOfDate(dateValue));
    if (!this.timeEnable) date.startOf('day');
    this.dateValue = date.valueOf();
    this.selectedDate = date;
  }

  setViewDate(): void {
    if (!this.dateValue) {
      this.viewDate = this.dateMax ? Jalali.timestamp(this.dateMax).endOf('year') : this.today.clone();
    } else {
      this.viewDate = this.dateMax && this.selectedDate.valueOf() > this.dateMax.valueOf() ?
        Jalali.timestamp(this.dateMax) : this.selectedDate.clone();
    }
    if (!this.timeEnable) this.viewDate.startOf('day');
    this.onChangeViewDate();
  }

  onChangeViewDate(): void {
    this.viewDate.startOf('month');
    this.setYears();
    this.setMonths();
    this.setDays();
    this.setViewDateTitle();
  }

  setYears(): void {
    this.years = [];
    const years = this.viewDate.clone();
    years.startOf('year');
    years.add(-6, 'year');
    for (let i = 0 ; i < 12 ; i++) {
      const year: number[] = [years.valueOf(), years.getFullYear()];
      this.years.push({
        timestamp: year[0],
        value: year[1],
        isYearOfTodayDate: this.isYearOfTodayDate(year),
        isYearOfSelectedDate: this.isYearOfSelectedDate(year),
        isYearDisabled: this.isYearDisabled(year)
      });
      years.add(1, 'year');
    }
  }

  setMonths(): void {
    this.months = [];
    const months = this.viewDate.clone();
    months.startOf('year');
    for (let i = 0 ; i < 12 ; i++) {
      const month: number[] = [months.valueOf(), months.getFullYear(), months.getMonth()];
      this.months.push({
        timestamp: month[0],
        year: month[1],
        indexValue: month[2],
        isMonthOfTodayDate: this.isMonthOfToday(month),
        isMonthOfSelectedDate: this.isMonthOfSelectedDate(month),
        isMonthDisabled: this.isMonthDisabled(month)
      });
      months.add(1, 'month');
    }
  }

  setDays(): void {
    this.days = [];

    const prevMonthDetails: number[][] = [];
    const currentMonthDetails: number[][] = [];
    const nextMonthDetails: number[][] = [];

    const prevMonth = Jalali.timestamp(this.viewDate.valueOf());
    const currentMonth = Jalali.timestamp(this.viewDate.valueOf());
    const nextMonth = Jalali.timestamp(this.viewDate.valueOf());

    prevMonth.add(-1, 'month');
    nextMonth.add(1, 'month');

    const currentMonthDays: number = currentMonth.monthLength();
    const prevMonthDays: number = prevMonth.monthLength();
    const nextMonthDays: number = nextMonth.monthLength();

    for (let i = 0 ; i < prevMonthDays ; i++) {
      prevMonthDetails.push([prevMonth.valueOf(), prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate()]);
      prevMonth.add(1, 'day');
    }
    for (let i = 0 ; i < currentMonthDays ; i++) {
      currentMonthDetails.push([currentMonth.valueOf(), currentMonth.getFullYear(), currentMonth.getMonth(), currentMonth.getDate()]);
      currentMonth.add(1, 'day');
    }
    for (let i = 0 ; i < nextMonthDays ; i++) {
      nextMonthDetails.push([nextMonth.valueOf(), nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate()]);
      nextMonth.add(1, 'day');
    }

    for (let row = 0; row < 6 ; row++) {
      const rowValue: IDay[] = [];

      for (let col = 0; col < 7 ; col++) {
        const fromPrevMonth: number = (this.viewDate.date.getDay() === 6) ? 0 : (this.viewDate.date.getDay() + 1);
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
    const year: number = this.viewDate ? this.viewDate.getFullYear() : 0;
    if (!year) {
      return;
    }
    switch (this.viewModes[this.viewModeIndex]) {
      case 'day':
        this.viewDateTitle = months[this.viewDate.getMonth()] + ' ' + year.toString();
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

    if (this.dateValue) {
      this.formControl?.setValue(Jalali.timestamp(this.dateValue).format(this.dateFormat));
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
      this.viewDate.add(skip, 'year');
    } else if (type === 2) {
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
    this.viewDate = Jalali.timestamp(year.timestamp);
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
    this.viewDate = Jalali.timestamp(month.timestamp);
    this.viewModeIndex = this.viewModes.indexOf('day');
    this.onChangeViewDate();
  }

  dayClick(day: IDay): void {
    if (day.isDayDisabled) {
      return;
    }
    this.changeSelectedDate(Jalali.timestamp(day.timestamp));
  }

  isYearOfTodayDate(year: number[]): boolean {
    return (
      this.today.getFullYear() === year[1]
    );
  }

  isYearOfSelectedDate(year: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      year[1] === this.selectedDate.getFullYear()
    );
  }

  isYearDisabled(month: number[]): boolean {
    return !this.isDateInRange(month[0], true, false);
  }

  isMonthOfToday(month: number[]): boolean {
    return (
      this.today.getFullYear() === month[1] &&
      this.today.getMonth() === month[2]
    );
  }

  isMonthOfSelectedDate(month: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      month[1] === this.selectedDate.getFullYear() &&
      month[2] === this.selectedDate.getMonth()
    );
  }

  isMonthDisabled(month: number[]): boolean {
    return !this.isDateInRange(month[0], false, true);
  }

  isDayInCurrentMonth(day: number[]): boolean {
    return (
      day[1] === this.viewDate.getFullYear() &&
      day[2] === this.viewDate.getMonth()
    );
  }

  isDayOfTodayDate(day: number[]): boolean {
    return (
      day[1] === this.today.getFullYear() &&
      day[2] === this.today.getMonth() &&
      day[3] === this.today.getDate()
    );
  }

  isDayOfSelectedDate(day: number[]): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      day[1] === this.selectedDate.getFullYear() &&
      day[2] === this.selectedDate.getMonth() &&
      day[3] === this.selectedDate.getDate()
    );
  }

  isDayDisabled(day: number[]): boolean {
    return !this.isDateInRange(day[0], false, false);
  }

  isDateInRange(date: number, isYear: boolean, isMonth: boolean): boolean {
    const result: boolean[] = [];
    if (this.dateMin) {
      const min = Jalali.timestamp(this.dateMin);
      if (isYear) {
        min.startOf('year');
      }
      if (isMonth) {
        min.startOf('month');
      }
      result.push(min.valueOf() <= date);
    }
    if (this.dateMax) {
      const max = Jalali.timestamp(this.dateMax);
      if (isYear) {
        max.startOf('year');
      }
      if (isMonth) {
        max.startOf('month');
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
      this.selectedDate.setHours(this.hour);
      this.selectedDate.setMinutes(this.minute);
      this.selectedDate.setSeconds(this.second);
      this.selectedDate.setMilliseconds(0);
    } else {
      this.setToday();
      this.selectedDate.setHours(this.today.getHours());
      this.selectedDate.setMinutes(this.today.getMinutes());
      this.selectedDate.setSeconds(this.today.getSeconds());
      this.selectedDate.setMilliseconds(this.today.getMilliseconds());
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
      gregorian: String(this.selectedDate.format(this.dateGregorianFormat, true)),
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
      const gregorian: boolean = (this.dateIsGregorian && !this.dateValue);
      return Jalali.parse(date, gregorian).valueOf();
    }

    return date;
  }

  private setUiIsVisible(value: boolean): void {
    this.uiIsVisible = value;
    this.uiIsVisibleChange.next(value);
    this.scrollIntoActiveTime();
  }

}
