'use strict';

export const keyMap = {
  play_pause: {
    toggle: { keyboard: 'p', midi: undefined }
  },
  cutter: {
    trigger: { keyboard: 'c', midi: undefined }
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
};

export default keyMap;
