'use strict';

export default class Cutter extends GainNode {
  constructor(context, options) {
    super(context, options);
    this.previousGainValue = undefined;
    this.active = false;
  }

  on() {
    if (!this.active) {
      this.previousGainValue = this.gain.value;
      this.gain.value = 0;
      this.active = true;
    }
  }

  off() {
    this.gain.value = this.previousGainValue;
    this.active = false;
  }
}
