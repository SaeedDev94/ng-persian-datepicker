# NgPersianDatepicker

Persian datepicker for angular 8+

# Install

```
npm install ng-persian-datepicker --save
npm install moment-jalaali@^0.9.1 --save
npm install @types/moment-jalaali@^0.7.4 --save
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

Import module:

```typescript
...
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
...

@NgModule({
  imports: [
    ...
    NgPersianDatepickerModule,
    ...
  ],
  ...
})
...
```

# Implement

```html
<input type="text" #datepickerInput />
<ng-persian-datepicker
  [input]="datepickerInput"></ng-persian-datepicker>
```

That's it! this was a minimal setup ...

# Config

You can customize datepicker config:

```html
<input type="text" #datepickerInput />
<ng-persian-datepicker
  [input]="datepickerInput"
  [uiTheme]="'dark'"
  [timeMeridian]="true"></ng-persian-datepicker>
```

complete config reference:

| Key                    | Type          | Description                                                                        | Example                                                                |
| ---------------------- | ------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| dateValue              | string        | value of date                                                                      | '1398-12-15 14:32:45'                                                  |
| dateInitValue          | boolean       | if no dateValue provided use today as init value                                   | true                                                                   |
| dateIsGregorian        | boolean       | is dateValue gregorian?                                                            | false                                                                  |
| dateFormat             | string        | shamsi date format, see moment and moment-jalaali docs to see available formats    | 'jYYYY-jMM-jDD HH:mm:ss'                                               |
| dateGregorianFormat    | string        | gregorian date format, see moment and moment-jalaali docs to see available formats | 'YYYY-MM-DD HH:mm:ss'                                                  |
| dateMin                | moment.Moment | min date that user can select                                                      | moment('1396-11-01', 'jYYYY-jMM-jDD')                                  |
| dateMax                | moment.Moment | max date that user can select                                                      | moment('1398-11-01', 'jYYYY-jMM-jDD')                                  |
| dateOnSelect           | callback      | onSelect date callback                                                             | (shamsiDate: string, gregorianDate: string, date: moment.Moment) => {} |
| timeEnable             | boolean       | if set it to true time picker will visible                                         | true                                                                   |
| timeShowSecond         | boolean       | time second visibility                                                             | true                                                                   |
| timeMeridian           | boolean       | show time in 12 hour format                                                        | false                                                                  |
| uiTheme                | string        | datepicker theme: 'default', 'blue', 'gray', 'dark', 'black'                       | 'dark'                                                                 |
| uiIsVisible            | boolean       | only when this is true datepicker is visible                                       | true                                                                   |
| uiHideOnOutSideClick   | boolean       | if set to true datepicker will hide on out side click                              | true                                                                   |
| uiHideAfterSelectDate  | boolean       | hide datepicker after date select                                                  | true                                                                   |
| uiYearView             | boolean       | if set to true month view will enable                                              | true                                                                   |
| uiMonthView            | boolean       | if set to true month view will enable                                              | true                                                                   |
| uiAutoPosition         | boolean       | datepicker absolute position (always under input)                                  | true                                                                   |
| uiPositionOffset       | Array<number> | modify datepicker uiAutoPosition                                                   | [15, 10]                                                               |
| uiContainerWidth       | string        | if uiAutoPosition is true you can set container width                              | '200px'                                                                |

# Demo

you can download a release and see ng-persian-datepicker demo:

```
cd /to/ng-persian-datepicker/dir
npm install
npm run start
```

open `http://localhost:4200` in your browser
