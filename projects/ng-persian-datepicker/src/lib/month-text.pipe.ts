import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthText'
})
export class MonthTextPipe implements PipeTransform {

  static months = [
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
    return MonthTextPipe.months[index];
  }

}
