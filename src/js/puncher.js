'use strict';

export default class Puncher extends GainNode {
  constructor(context, options) {
    super(context, options);
    this.previousGainValue;
    this.active = false;
    this.armed = false;
  }

  arm() {
    if (!this.armed) {
      this.armed = true;
      this.previousGainValue = this.gain.value;
      this.setGain();
    }
  }

  disarm() {
    this.armed = false;
    this.setGain();
  }

  on() {
    if (typeof this.previousGainValue === 'undefined') {
      this.previousGainValue = this.gain.value;
    }
    this.active = true;
    this.setGain();
  }

  off() {
    this.active = false;
    this.setGain();
  }

  setGain() {
    if (this.armed && this.active || !this.armed) {
      this.gain.value = this.previousGainValue;
    } else {
      this.gain.value = 0;
    }
  }
}
