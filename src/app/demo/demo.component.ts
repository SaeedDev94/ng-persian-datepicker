import { Component } from '@angular/core';
import { IActiveDate } from '../../../projects/ng-persian-datepicker/src/public-api';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  form = this.formBuilder.group({
    dateValue: new Date().valueOf()
  });

  uiIsVisible: boolean = true;
  uiTheme: string = 'default';
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;
  uiTodayBtnEnable: boolean = true;

  timeEnable: boolean = true;
  timeShowSecond: boolean = true;
  timeMeridian: boolean = false;

  onSelect(date: IActiveDate) {
    console.log(date);
  }

}
