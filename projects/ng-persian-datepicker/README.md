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

```typescript
...
import moment from 'moment-jalaali';
import { ConfigModel } from 'ng-persian-datepicker';
...

...
  config: ConfigModel = {
    date: {
      value: '1398-12-15 14:32:45',
      ...
      onSelect: (shamsiDate: string, gregorianDate: string, date: moment.Moment) => {
        console.log(shamsiDate, gregorianDate, date);
      }
    },
    ui: {
      theme: 'dark',
      ...
    },
    ...
  };
...
```

```html
<input type="text" #datepickerInput />
<ng-persian-datepicker
  [input]="datepickerInput"
  [config]="config"></ng-persian-datepicker>
```

complete config reference:

| Key                    | Type          | Description                                                                        | Example                                                                |
| ---------------------- | ------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| date.value             | string        | value of date                                                                      | '1398-12-15 14:32:45'                                                  |
| date.initValue         | boolean       | if no date.value provided use today as init value                                  | true                                                                   |
| date.isGregorian       | boolean       | is date.value gregorian?                                                           | false                                                                  |
| date.format            | string        | shamsi date format, see moment and moment-jalaali docs to see available formats    | 'jYYYY-jMM-jDD HH:mm:ss'                                               |
| date.gregorianFormat   | string        | gregorian date format, see moment and moment-jalaali docs to see available formats | 'YYYY-MM-DD HH:mm:ss'                                                  |
| date.min               | moment.Moment | min date that user can select                                                      | moment('1396-11-01', 'jYYYY-jMM-jDD')                                  |
| date.max               | moment.Moment | max date that user can select                                                      | moment('1398-11-01', 'jYYYY-jMM-jDD')                                  |
| date.onSelect          | callback      | onSelect date callback                                                             | (shamsiDate: string, gregorianDate: string, date: moment.Moment) => {} |
| time.enable            | boolean       | if set it to true time picker will visible                                         | true                                                                   |
| time.showSecond        | boolean       | time second visibility                                                             | true                                                                   |
| time.meridian          | boolean       | show time in 12 hour format                                                        | false                                                                  |
| ui.theme               | string        | datepicker theme: 'default', 'blue', 'gray', 'dark', 'black'                       | 'dark'                                                                 |
| ui.isVisible           | boolean       | only when this is true datepicker is visible                                       | true                                                                   |
| ui.hideOnOutSideClick  | boolean       | if set to true datepicker will hide on out side click                              | true                                                                   |
| ui.hideAfterSelectDate | boolean       | hide datepicker after date select                                                  | true                                                                   |
| ui.yearView            | boolean       | if set to true month view will enable                                              | true                                                                   |
| ui.monthView           | boolean       | if set to true month view will enable                                              | true                                                                   |
| ui.autoPosition        | boolean       | datepicker absolute position (always under input)                                  | true                                                                   |
| ui.positionOffset      | Array<number> | modify datepicker ui.autoPosition                                                  | [15, 10]                                                               |
| ui.containerWidth      | string        | if ui.autoPosition is true you can set container width                             | '200px'                                                                |

# Demo

you can download a release and see ng-persian-datepicker demo:

```
cd /to/ng-persian-datepicker/dir
npm install
npm run start
```

open `http://localhost:4200` in your browser
