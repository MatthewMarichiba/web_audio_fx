'use strict';

export default class Cutter extends GainNode {
  constructor(context, options) {
    super(context, options);
    this.previousGainValue = undefined;
  }

  on() {
    this.previousGainValue = this.gain.value;
    this.gain.value = 0;
  }

  off() {
    this.gain.value = this.previousGainValue;
  }
}
