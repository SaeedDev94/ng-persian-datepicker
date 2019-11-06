import { ConfigModel } from '../model/config.model';

const InitConfig: ConfigModel = {
  date: {
    value: '',
    initValue: true,
    isGregorian: false,
    format: 'jYYYY-jMM-jDD HH:mm:ss',
    gregorianFormat: 'YYYY-MM-DD HH:mm:ss',
    min: null,
    max: null,
    onSelect: () => {}
  },
  ui: {
    theme: 'default',
    isVisible: false,
    hideOnOutSideClick: true,
    hideAfterSelectDate: true,
    yearView: true,
    monthView: true,
    autoPosition: true,
    positionOffset: [0, 0],
    containerWidth: ''
  },
  time: {
    enable: true,
    showSecond: true,
    meridian: false
  }
};

export {
  InitConfig
};
