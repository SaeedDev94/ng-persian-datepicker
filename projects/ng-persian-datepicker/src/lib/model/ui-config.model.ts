export interface UiConfigModel {

  /**
   * @description datepicker theme
   */
  theme?: string;

  /**
   * @description only when this is true datepicker is visible
   */
  isVisible?: boolean;

  /**
   * @description if set to true datepicker will hide on out side click
   */
  hideOnOutsideClick?: boolean;

  /**
   * @description hide datepicker after date select
   */
  hideAfterSelectDate?: boolean;

  /**
   * @description if set to true year view will enable
   */
  yearView?: boolean;

  /**
   * @description if set to true month view will enable
   */
  monthView?: boolean;
}
