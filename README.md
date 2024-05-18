# NgPersianDatepicker

Persian datepicker for angular 17+  
**[Online demo](https://saeeddev94.github.io/ng-persian-datepicker/)**

# Install

```
npm install ng-persian-datepicker
npm install jalali-ts@^2.0.5
```

# Setup

Import modules:

```typescript
...
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { ReactiveFormsModule } from '@angular/forms';
...

@NgModule({
  imports: [
    ...
      NgPersianDatepickerModule,
      ReactiveFormsModule,
    ...
  ],
  ...
})
...
```

# Implement

```typescript
import { FormControl } from '@angular/forms';

@Component(...)
class DateComponent {

  dateValue = new FormControl();

}
```

```html
<ng-persian-datepicker>
  <input type="text" [formControl]="dateValue" />
</ng-persian-datepicker>
```

That's it! this was a minimal setup ...

# Config [input]

You can customize datepicker config:

```html
<ng-persian-datepicker [uiTheme]="darkTheme" ...>
  ...
</ng-persian-datepicker>
```

Complete config reference:

| Key                   | Type             | Description                                                                                 | Example                                |
|-----------------------|------------------|---------------------------------------------------------------------------------------------|----------------------------------------|
| calendarIsGregorian   | boolean          | set this to `true` if you want gregorian calendar. default: `false`                         | true                                   |
| dateValue             | FormControl      | use this if you don't need a html input                                                     | dateValue: FormControl                 |           
| dateInitValue         | boolean          | if no dateValue provided use today as init value. default: `true`                           | true                                   |
| dateIsGregorian       | boolean          | is dateValue gregorian?. default: `false`                                                   | false                                  |
| dateFormat            | string           | shamsi date format, check jalali-ts docs to see available formats. default: `YYYY/MM/DD`    | 'YYYY-MM-DD HH:mm:ss'                  |
| dateGregorianFormat   | string           | gregorian date format, check jalali-ts docs to see available formats. default: `YYYY-MM-DD` | 'YYYY-MM-DD HH:mm:ss'                  |
| dateMin               | number           | min date that user can select (timestamp) . default: `null`                                 | Jalali.parse('1396-11-01').valueOf()   |
| dateMax               | number           | max date that user can select (timestamp) . default: `null`                                 | Jalali.parse('1398-11-01').valueOf()   |
| timeEnable            | boolean          | if set it to true time picker will visible. default: `false`                                | true                                   |
| timeShowSecond        | boolean          | time second visibility. default: `false`                                                    | true                                   |
| timeMeridian          | boolean          | show time in 12 hour format. default: `false`                                               | false                                  |
| uiTheme               | IDatepickerTheme | datepicker theme, default: `defaultTheme: IDatepickerTheme`                                 | darkTheme: IDatepickerTheme            |
| uiIsVisible           | boolean          | only when this is true datepicker is visible. default: `false`                              | true                                   |
| uiHideOnOutsideClick  | boolean          | if set to true datepicker will hide on outside click. default: `true`                       | true                                   |
| uiHideAfterSelectDate | boolean          | hide datepicker after date select. default: `true`                                          | true                                   |
| uiYearView            | boolean          | if set to true year view will enable. default: `true`                                       | true                                   |
| uiMonthView           | boolean          | if set to true month view will enable. default: `true`                                      | true                                   |
| uiInitViewMode        | string           | Initial view mode ('year', 'month', 'day'). default: `'day'`                                | 'year'                                 |
| uiTodayBtnEnable      | boolean          | Show go to today btn or not. default: `true`                                                | false                                  |

# Event (output)

Complete events reference:

| Key               | Type                | Description                           | Example                                       |
|-------------------|---------------------|---------------------------------------|-----------------------------------------------|
| dateOnInit        | $event: IActiveDate | Fire event on setting init date value | (dateOnInit)="onInit($event)"                 |
| dateOnSelect      | $event: IActiveDate | Fire event on date select             | (dateOnSelect)="onSelect($event)"             |
| uiIsVisibleChange | $event: boolean     | Fire event on visibility change       | (uiIsVisibleChange)="onVisibleChange($event)" |

# jalali-ts

Since `ng-persian-datepicker@^6.x.x` using `jalali-ts` instead of `moment-jalaali`, there are some limitations for parsing input date + output format  
Please check **[jalali-ts](https://github.com/Saeed-Pooyanfar/jalali-ts)** for more information

# IActiveDate

It doesn't matter that you have timestamp or gregorian date as initial value,  
The value of `dateValue: FormControl` is a shamsi (jalai) date string!  
But what if you want timestamp or gregorian date of selected date?  
First take a look at **[IActiveDate](https://github.com/Saeed-Pooyanfar/ng-persian-datepicker/blob/master/projects/ng-persian-datepicker/src/lib/interface/IActiveDate.ts)**  
As you saw, `IActiveDate` includes shamsi date, gregorian date and timestamp.  
The lib has 2 events of type `IActiveDate`:

- dateOnInit
- dateOnSelect

So, if you need to create `Date` object of selected date:  

```typescript
import { IActiveDate } from 'ng-persian-datepicker';

@Component(...)
class DateComponent {
  
  onSelect(event: IActiveDate): void {
    const viaTimestampValue = new Date(event.timestamp);
    const viaGregorianDate = new Date(event.gregorian);
  }
  
}
```

```html
<ng-persian-datepicker (dateOnSelect)="onSelect($event)" ...>
  ...
</ng-persian-datepicker>
```

# Custom theme

Every app has its unique theme, static themes maybe are easy to use but hard to customize!  
With custom theme feature you can create your custom theme base on your app theme.  
To create a custom theme you need a set of colors for every part of datepicker component.  
Example:

```typescript
import { IDatepickerTheme } from 'ng-persian-datepicker';

const customTheme: Partial<IDatepickerTheme> = {
  selectedBackground: '#D68E3A',
  selectedText: '#FFFFFF',
};
```

```html
<ng-persian-datepicker [uiTheme]="customTheme" ...>
  ...
</ng-persian-datepicker>
```

Checkout **[IDatepickerTheme](https://github.com/Saeed-Pooyanfar/ng-persian-datepicker/blob/master/projects/ng-persian-datepicker/src/lib/interface/IDatepickerTheme.ts)** interface to see all available props  
And **[darkTheme](https://github.com/Saeed-Pooyanfar/ng-persian-datepicker/blob/master/src/app/demo/datepicker-theme/dark.theme.ts)** for full example

> **Note**  
> Your theme will merge with defaultTheme,  
> So if you don't provide all colors, the defaultTheme value will use for the missing parts

# Offline demo

you can download a release and see ng-persian-datepicker demo:

```
cd /to/ng-persian-datepicker/dir
npm install
npm run start
```

open `http://localhost:4200` in your browser
