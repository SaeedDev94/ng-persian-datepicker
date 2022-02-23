# NgPersianDatepicker

Persian datepicker for angular 8+
[Online demo](https://saeed-pooyanfar.github.io/ng-persian-datepicker/)

# Install

```
npm install ng-persian-datepicker --save
npm install moment-jalaali@^0.9.4 --save
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
import { FormBuilder, FormGroup } from '@angular/forms';

@Component(...)
class DateComponent {

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  form: FormGroup = this.formBuilder.group({
    date: new Date().valueOf()
  });
}
```

```html
<form [formGroup]="form">
  <ng-persian-datepicker>
    <input type="text" formControlName="date" />
  </ng-persian-datepicker>
</form>
```

That's it! this was a minimal setup ...

# Config [input]

You can customize datepicker config:

```html
<form [formGroup]="form">
  <ng-persian-datepicker [uiTheme]="'dark'"
                         [timeMeridian]="true">
    <input type="text" formControlName="date" />
  </ng-persian-datepicker>
</form>
```

Complete config reference:

| Key                   | Type    | Description                                                                                                          | Example                                         |
|-----------------------|---------|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| dateInitValue         | boolean | if no dateValue provided use today as init value. default: `true`                                                    | true                                            |
| dateIsGregorian       | boolean | is dateValue gregorian?. default: `false`                                                                            | false                                           |
| dateFormat            | string  | shamsi date format, check moment and moment-jalaali docs to see available formats. default: `jYYYY-jMM-jDD HH:mm:ss` | 'jYYYY-jMM-jDD HH:mm:ss'                        |
| dateGregorianFormat   | string  | gregorian date format, check moment and moment-jalaali docs to see available formats. default: `YYYY-MM-DD HH:mm:ss` | 'YYYY-MM-DD HH:mm:ss'                           |
| dateMin               | number  | min date that user can select (timestamp) . default: `null`                                                          | moment('1396-11-01', 'jYYYY-jMM-jDD').valueOf() |
| dateMax               | number  | max date that user can select (timestamp) . default: `null`                                                          | moment('1398-11-01', 'jYYYY-jMM-jDD').valueOf() |
| timeEnable            | boolean | if set it to true time picker will visible. default: `true`                                                          | true                                            |
| timeShowSecond        | boolean | time second visibility. default: `true`                                                                              | true                                            |
| timeMeridian          | boolean | show time in 12 hour format. default: `false`                                                                        | false                                           |
| uiTheme               | string  | datepicker theme: 'default', 'blue', 'gray', 'dark', 'black'. default: `'default'`                                   | 'dark'                                          |
| uiIsVisible           | boolean | only when this is true datepicker is visible. default: `false`                                                       | true                                            |
| uiHideOnOutsideClick  | boolean | if set to true datepicker will hide on outside click. default: `true`                                                | true                                            |
| uiHideAfterSelectDate | boolean | hide datepicker after date select. default: `true`                                                                   | true                                            |
| uiYearView            | boolean | if set to true year view will enable. default: `true`                                                                | true                                            |
| uiMonthView           | boolean | if set to true month view will enable. default: `true`                                                               | true                                            |
| uiInitViewMode        | string  | Initial view mode ('year', 'month', 'day'). default: `'day'`                                                         | 'year'                                          |
| uiTodayBtnEnable      | boolean | Show go to today btn or not. default: `true`                                                                         | false                                           |

# Event (output)

Complete events reference:

| Key               | Type                | Description                           | Example                                       |
|-------------------|---------------------|---------------------------------------|-----------------------------------------------|
| dateOnInit        | $event: IActiveDate | Fire event on setting init date value | (dateOnInit)="onInit($event)"                 |
| dateOnSelect      | $event: IActiveDate | Fire event on date select             | (dateOnSelect)="onSelect($event)"             |
| uiIsVisibleChange | $event: boolean     | Fire event on visibility change       | (uiIsVisibleChange)="onVisibleChange($event)" |

# Offline demo

you can download a release and see ng-persian-datepicker demo:

```
cd /to/ng-persian-datepicker/dir
npm install
npm run start
```

open `http://localhost:4200` in your browser
