import { IDate } from './IDate';
import { IUi } from './IUi';
import { ITime } from './ITime';

export interface IConfig {

  /**
   * @description date config interface
   */
  date?: IDate;

  /**
   * @description ui config interface
   */
  ui?: IUi;

  /**
   * @description time config interface
   */
  time?: ITime;
}
