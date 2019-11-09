import moment from 'moment-jalaali';

export interface DateConfigModel {

  /**
   * @description value of date
   */
  value?: string | number;

  /**
   * @description if no value provided use today as init value
   */
  initValue?: boolean;

  /**
   * @description is date gregorian?
   */
  isGregorian?: boolean;

  /**
   * @description shamsi date format, see moment and moment-jalaali docs
   * to see available formats
   */
  format?: string;

  /**
   * @description gregorian date format, see moment and moment-jalaali docs
   * to see available formats
   */
  gregorianFormat?: string;

  /**
   * @description min date that user can select
   */
  min?: moment.Moment;

  /**
   * @description max date that user can select
   */
  max?: moment.Moment;

  /**
   * @description onSelect date callback
   */
  onSelect?: (shamsiDate: string, gregorianDate: string, timestamp: number) => void;
}
