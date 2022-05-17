import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgPersianDatepickerComponent } from './ng-persian-datepicker.component';
import { ThemeHoverDirective } from './directive/theme-hover.directive';
import { MonthPipe } from './pipe/month.pipe';

@NgModule({
  declarations: [
    NgPersianDatepickerComponent,
    ThemeHoverDirective,
    MonthPipe,
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
