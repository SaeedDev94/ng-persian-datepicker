import moment from 'moment-jalaali';
import { ConfigModel } from '../../../projects/ng-persian-datepicker/src/lib/model/config.model';
import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit, AfterContentInit {

  @ViewChild('datepickerInput', {static: false}) datepickerInput: ElementRef;

  constructor(
  ) {}

  config: ConfigModel = {
    date: {
      onSelect: (shamsiDate: string, gregorianDate: string, date: moment.Moment) => {
        console.log(shamsiDate, gregorianDate, date);
      }
    },
    ui: {
      theme: 'default',
      isVisible: true,
      hideAfterSelectDate: false,
      hideOnOutSideClick: false,
      yearView: true,
      monthView: true
    },
    time: {
      enable: true,
      showSecond: true,
      meridian: false
    }
  };

  ngOnInit() {
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.datepickerInput.nativeElement.focus();
    }, 0);
  }

}
