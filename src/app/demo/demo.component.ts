import moment from 'moment-jalaali';
import { ConfigModel } from '../../../projects/ng-persian-datepicker/src/lib/model/config.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {

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
      positionOffset: [10, 0],
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

}
