import {
  defaultTheme,
  IActiveDate,
  IDatepickerTheme
} from '../../../projects/ng-persian-datepicker/src/public-api';
import { darkTheme } from './datepicker-theme/dark.theme';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss'],
    standalone: false
})
export class DemoComponent {

  dateValue = new FormControl(new Date().valueOf());

  uiIsVisible: boolean = true;
  uiTheme: IDatepickerTheme = defaultTheme;
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;
  uiTodayBtnEnable: boolean = true;

  timeEnable: boolean = true;
  timeShowSecond: boolean = true;
  timeMeridian: boolean = false;

  private _theme: string = 'default';

  get theme(): string {
    return this._theme;
  }

  set theme(value: string) {
    this._theme = value;

    switch (value) {
      case 'dark':
        this.uiTheme = darkTheme;
        break;
      case 'default':
        this.uiTheme = defaultTheme;
        break;
    }
  }

  onSelect(date: IActiveDate) {
    console.log(date);
  }

}
