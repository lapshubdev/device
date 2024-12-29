const EventEmitter = require("events");

const Stopwatch = require("statman-stopwatch");
const sw = new Stopwatch();

("use strict");

class StopWatch {
  #t;
  #intervalTimer;

  constructor() {
    this.t = new EventEmitter.EventEmitter();
  }

  #convertToHumanReadable = (milliseconds) => {
    if (milliseconds) {
      var day, hour, minute, seconds, ms;
      ms = milliseconds.slice(-5);
      seconds = Math.floor(milliseconds / 1000);
      minute = Math.floor(seconds / 60);
      seconds = seconds % 60;
      hour = Math.floor(minute / 60);
      minute = minute % 60;
      day = Math.floor(hour / 24);
      hour = hour % 24;
      return {
        days: day,
        hours: hour,
        minutes: minute,
        seconds: seconds,
        miliseconds: ms,
      };
    }
  };

  #convertMS = (milliseconds) => {
    let time = (milliseconds / 1000).toFixed(3);
    let timeHuman = this.#convertToHumanReadable(milliseconds);
    return {
      time: time,
      timeHuman: timeHuman,
    };
  };

  #main = () => {
    this.t.emit("event", this.#convertMS(sw.read(1)));
  };

  startTime = () => {
    sw.start();
  };

  initTicker = (interval) => {
    this.#intervalTimer = setInterval(this.#main, interval);
  };

  clearTicker = () => {
    console.log("Turning off the ticker");
    clearInterval(this.#intervalTimer);
  };

  stopTime = () => {
    sw.stop();
    sw.reset();
  };

  getTime = () => {
    return this.t;
  };
}

module.exports = StopWatch;
