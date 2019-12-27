import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthText'
})
export class MonthTextPipe implements PipeTransform {

  private readonly months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];

  transform(index: number): string {
    return this.months[index];
  }

}
