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

| Key                    | Type             | Description                                                                                                        | Example                                                                |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| dateValue              | string or number | value of date. default: `''`                                                                                       | '1398-12-15 14:32:45' or 1583406165000                                 |
| dateInitValue          | boolean          | if no dateValue provided use today as init value. default: `true`                                                  | true                                                                   |
| dateIsGregorian        | boolean          | is dateValue gregorian?. default: `false`                                                                          | false                                                                  |
| dateFormat             | string           | shamsi date format, see moment and moment-jalaali docs to see available formats. default: `jYYYY-jMM-jDD HH:mm:ss` | 'jYYYY-jMM-jDD HH:mm:ss'                                               |
| dateGregorianFormat    | string           | gregorian date format, see moment and moment-jalaali docs to see available formats. default: `YYYY-MM-DD HH:mm:ss` | 'YYYY-MM-DD HH:mm:ss'                                                  |
| dateMin                | number           | min date that user can select (timestamp) . default: `null`                                                        | moment('1396-11-01', 'jYYYY-jMM-jDD').valueOf()                        |
| dateMax                | number           | max date that user can select (timestamp) . default: `null`                                                        | moment('1398-11-01', 'jYYYY-jMM-jDD').valueOf()                        |
| dateOnSelect           | callback         | onSelect date callback. default: `() => {}`                                                                        | (shamsiDate: string, gregorianDate: string, timestamp: number) => {}   |
| timeEnable             | boolean          | if set it to true time picker will visible. default: `true`                                                        | true                                                                   |
| timeShowSecond         | boolean          | time second visibility. default: `true`                                                                            | true                                                                   |
| timeMeridian           | boolean          | show time in 12 hour format. default: `false`                                                                      | false                                                                  |
| uiTheme                | string           | datepicker theme: 'default', 'blue', 'gray', 'dark', 'black'. default: `'default'`                                 | 'dark'                                                                 |
| uiIsVisible            | boolean          | only when this is true datepicker is visible. default: `false`                                                     | true                                                                   |
| uiHideOnOutsideClick   | boolean          | if set to true datepicker will hide on outside click. default: `true`                                              | true                                                                   |
| uiHideAfterSelectDate  | boolean          | hide datepicker after date select. default: `true`                                                                 | true                                                                   |
| uiYearView             | boolean          | if set to true year view will enable. default: `true`                                                              | true                                                                   |
| uiMonthView            | boolean          | if set to true month view will enable. default: `true`                                                             | true                                                                   |
| uiAutoPosition         | boolean          | datepicker absolute position (beta: not working as expected in every cases). default: `false`                      | true                                                                   |
| uiPositionOffset       | Array<number>    | modify datepicker uiAutoPosition. default: `[0, 0]`                                                                | [15, 10]                                                               |
| uiContainerWidth       | string           | if uiAutoPosition is true you can set container width. default: `''`                                               | '200px'                                                                |

# Demo

you can download a release and see ng-persian-datepicker demo:

```
cd /to/ng-persian-datepicker/dir
npm install
npm run start
```

open `http://localhost:4200` in your browser
