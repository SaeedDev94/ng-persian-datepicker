import { Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {

  dateValue = new Date().valueOf();
  dateOnSelect = (shamsiDate: string, gregorianDate: string, timestamp: number) => {
    console.log(shamsiDate, gregorianDate, timestamp);
  }

  uiIsVisible: boolean = true;
  uiTheme: string = 'default';
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;

  timeEnable: boolean = true;
  timeShowSecond: boolean = true;
  timeMeridian: boolean = false;

}
