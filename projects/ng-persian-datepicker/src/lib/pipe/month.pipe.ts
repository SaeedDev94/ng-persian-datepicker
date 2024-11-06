import { Pipe, PipeTransform } from '@angular/core';
import { enMonths, faMonths } from './locale';

@Pipe({
  name: 'month',
  standalone: false,
})
export class MonthPipe implements PipeTransform {

  transform(index: number, gregorian: boolean): string {
    return gregorian ? enMonths[index] : faMonths[index];
  }

}
