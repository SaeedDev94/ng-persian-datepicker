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
      value: new Date().valueOf(),
      onSelect: (shamsiDate: string, gregorianDate: string, timestamp: number) => {
        console.log(shamsiDate, gregorianDate, timestamp);
      }
    },
    ui: {
      theme: 'default',
      isVisible: true,
      hideAfterSelectDate: false,
      hideOnOutsideClick: false,
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
