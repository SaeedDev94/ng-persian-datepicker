import { NgModule } from '@angular/core';
import { NgPersianDatepickerComponent } from './ng-persian-datepicker.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NgPersianDatepickerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgPersianDatepickerComponent
  ]
})
export class NgPersianDatepickerModule {}
