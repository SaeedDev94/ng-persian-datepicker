import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoRoutingModule } from './demo-routing.module';
import { DemoComponent } from './demo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgPersianDatepickerModule } from '../../../projects/ng-persian-datepicker/src/lib/ng-persian-datepicker.module';

@NgModule({
  declarations: [
    DemoComponent
  ],
  imports: [
    CommonModule,
    DemoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgPersianDatepickerModule
  ]
})
export class DemoModule {
}
