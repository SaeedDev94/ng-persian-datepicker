export interface IDay {
  timestamp: number;
  year: number;
  monthIndex: number;
  value: number;
  isDayInCurrentMonth: boolean;
  isDayOfTodayDate: boolean;
  isDayOfSelectedDate: boolean;
  isDayDisabled: boolean;
}
