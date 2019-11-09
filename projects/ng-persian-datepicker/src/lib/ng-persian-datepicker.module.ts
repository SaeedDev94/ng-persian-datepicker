import { NgModule } from '@angular/core';
import { NgPersianDatepickerComponent } from './ng-persian-datepicker.component';
import { CommonModule } from '@angular/common';
import { MonthTextPipe } from './month-text.pipe';

@NgModule({
  declarations: [
    NgPersianDatepickerComponent,
    MonthTextPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgPersianDatepickerComponent
  ]
})
export class NgPersianDatepickerModule {}
