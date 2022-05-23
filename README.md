# NgPersianDatepicker

Persian datepicker for angular 12+
[Online demo](https://saeed-pooyanfar.github.io/ng-persian-datepicker/)

# Install

```
npm install ng-persian-datepicker --save
npm install moment-jalaali@^0.9.6 --save
npm install @types/moment-jalaali@^0.7.5 --save-dev
```

After install, edit tsconfig.json:

```javascript
{
...
  "compilerOptions": {
  ...
    "allowSyntheticDefaultImports": true,
  ...
  },
...
}
```

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
<ng-persian-datepicker [uiTheme]="darkTheme"
                       [timeMeridian]="true">
  <input type="text" [formControl]="dateValue" />
</ng-persian-datepicker>
```

Complete config reference:

| Key                   | Type             | Description                                                                                                          | Example                                         |
|-----------------------|------------------|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| dateValue             | FormControl      | use this if you don't need a html input                                                                              | dateValue: FormControl                          |           
| dateInitValue         | boolean          | if no dateValue provided use today as init value. default: `true`                                                    | true                                            |
| dateIsGregorian       | boolean          | is dateValue gregorian?. default: `false`                                                                            | false                                           |
| dateFormat            | string           | shamsi date format, check moment and moment-jalaali docs to see available formats. default: `jYYYY-jMM-jDD HH:mm:ss` | 'jYYYY-jMM-jDD HH:mm:ss'                        |
| dateGregorianFormat   | string           | gregorian date format, check moment and moment-jalaali docs to see available formats. default: `YYYY-MM-DD HH:mm:ss` | 'YYYY-MM-DD HH:mm:ss'                           |
| dateMin               | number           | min date that user can select (timestamp) . default: `null`                                                          | moment('1396-11-01', 'jYYYY-jMM-jDD').valueOf() |
| dateMax               | number           | max date that user can select (timestamp) . default: `null`                                                          | moment('1398-11-01', 'jYYYY-jMM-jDD').valueOf() |
| timeEnable            | boolean          | if set it to true time picker will visible. default: `true`                                                          | true                                            |
| timeShowSecond        | boolean          | time second visibility. default: `true`                                                                              | true                                            |
| timeMeridian          | boolean          | show time in 12 hour format. default: `false`                                                                        | false                                           |
| uiTheme               | IDatepickerTheme | datepicker theme, default: `defaultTheme: IDatepickerTheme`                                                          | darkTheme: IDatepickerTheme                     |
| uiIsVisible           | boolean          | only when this is true datepicker is visible. default: `false`                                                       | true                                            |
| uiHideOnOutsideClick  | boolean          | if set to true datepicker will hide on outside click. default: `true`                                                | true                                            |
| uiHideAfterSelectDate | boolean          | hide datepicker after date select. default: `true`                                                                   | true                                            |
| uiYearView            | boolean          | if set to true year view will enable. default: `true`                                                                | true                                            |
| uiMonthView           | boolean          | if set to true month view will enable. default: `true`                                                               | true                                            |
| uiInitViewMode        | string           | Initial view mode ('year', 'month', 'day'). default: `'day'`                                                         | 'year'                                          |
| uiTodayBtnEnable      | boolean          | Show go to today btn or not. default: `true`                                                                         | false                                           |

# Event (output)

Complete events reference:

| Key               | Type                | Description                           | Example                                       |
|-------------------|---------------------|---------------------------------------|-----------------------------------------------|
| dateOnInit        | $event: IActiveDate | Fire event on setting init date value | (dateOnInit)="onInit($event)"                 |
| dateOnSelect      | $event: IActiveDate | Fire event on date select             | (dateOnSelect)="onSelect($event)"             |
| uiIsVisibleChange | $event: boolean     | Fire event on visibility change       | (uiIsVisibleChange)="onVisibleChange($event)" |

# Custom theme

Every app has its unique theme, static themes maybe are easy to use but hard to customize!  
With custom theme feature you can create your custom theme base on your app theme.  
To create a custom theme you need a set of colors for every part of datepicker component.  
Example:

```typescript
import { IDatepickerTheme } from 'ng-persian-datepicker';

darkTheme: IDatepickerTheme = {
  ...
  selectedBackground: '#D68E3A',
  selectedText: '#FFFFFF',
  ...
};
```

Checkout [IDatepickerTheme](https://github.com/Saeed-Pooyanfar/ng-persian-datepicker/blob/master/projects/ng-persian-datepicker/src/lib/interface/IDatepickerTheme.ts) interface to see all available props  
And [darkTheme](https://github.com/Saeed-Pooyanfar/ng-persian-datepicker/blob/master/src/app/demo/datepicker-theme/dark.theme.ts) for full example

# Offline demo

you can download a release and see ng-persian-datepicker demo:

```
cd /to/ng-persian-datepicker/dir
npm install
npm run start
```

open `http://localhost:4200` in your browser
