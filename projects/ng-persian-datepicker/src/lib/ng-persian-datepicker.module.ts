import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgPersianDatepickerComponent } from './ng-persian-datepicker.component';
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
export class NgPersianDatepickerModule {
}
