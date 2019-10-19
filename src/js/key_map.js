'use strict';

export const keyMap = {
  play_pause: {
    toggle: { keyboard: 'p', midi: undefined }
  },
  cutter: {
    trigger: { keyboard: 'c', midi: undefined }
  },
  puncher: {
    arm: { keyboard: 'v', midi: undefined },
    trigger: { keyboard: 'b', midi: undefined }
  },
  stretcher: {
    trigger: { keyboard: 's', midi: undefined }
  },
  pan: {
    up: { keyboard: '', midi: undefined },
    down: { keyboard: '', midi: undefined },
    increment: 0.05
  },
  vol: {
    up: { keyboard: '', midi: undefined },
    down: { keyboard: '', midi: undefined },
    increment: 0.05
  },
  lp: {
    up: { keyboard: '', midi: undefined },
    down: { keyboard: '', midi: undefined },
    increment: 20
  },
};

export default keyMap;
