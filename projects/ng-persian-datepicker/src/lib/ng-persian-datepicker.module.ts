import { NgModule } from '@angular/core';
import { NgPersianDatepickerComponent } from './ng-persian-datepicker.component';
import { CommonModule } from '@angular/common';
import { MonthPipe } from './pipe/month.pipe';

@NgModule({
  declarations: [
    NgPersianDatepickerComponent,
    MonthPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgPersianDatepickerComponent
  ]
})
export class NgPersianDatepickerModule {}
