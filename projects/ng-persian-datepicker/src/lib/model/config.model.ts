import { DateConfigModel } from './date-config.model';
import { UiConfigModel } from './ui-config.model';
import { TimeConfigModel } from './time-config.model';

export interface ConfigModel {

  /**
   * @description date config model
   */
  date?: DateConfigModel;

  /**
   * @description ui config model
   */
  ui?: UiConfigModel;

  /**
   * @description time config model
   */
  time?: TimeConfigModel;
}
