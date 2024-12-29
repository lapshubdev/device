"use strict";

class LaptimeMath {
  constructor() {}

  #sortByProperty = (property) => {
    return function (a, b) {
      if (a[property] > b[property]) return 1;
      else if (a[property] < b[property]) return -1;
      return 0;
    };
  };

  convertSingleLaptimeToMs = (lap) => {
    let splittedStr = lap.split(":");
    let splittedStrFraction = lap.split(".");

    let minutes = Math.floor(Number(splittedStr[0]) * 60000);
    let seconds = Math.floor(Number(splittedStr[1]) * 1000);
    let millisecondsFraction = Math.floor(Number(splittedStrFraction[1]));
    let milliseconds = Math.floor(Number(splittedStr[2]));

    let sum = minutes + seconds + milliseconds + `.${millisecondsFraction}`;

    return sum;
  };

  #convertLaptimeToMs = (laptimes) => {
    for (let lap of laptimes) {
      let splittedStr = lap.lap_time.split(":");
      let splittedStrFraction = lap.lap_time.split(".");

      let minutes = Math.floor(Number(splittedStr[0]) * 60000);
      let seconds = Math.floor(Number(splittedStr[1]) * 1000);
      let millisecondsFraction = Math.floor(Number(splittedStrFraction[1]));
      let milliseconds = Math.floor(Number(splittedStr[2]));

      let sum = minutes + seconds + milliseconds + `.${millisecondsFraction}`;

      lap.laptimeInMs = sum;
    }
    return laptimes;
  };

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

  sortLaptimesByTime = (laptimes) => {
    let laptimesInMs = this.#convertLaptimeToMs(laptimes);
    let sortedLaptimes = laptimes.sort((a, b) => a.laptimeInMs - b.laptimeInMs);

    return sortedLaptimes;
  };

  sortLaptimesByLapNumber = (laptimes) => {
    let sortedLaptimes = laptimes.sort((a, b) => a.lapnumber - b.lapnumber);

    return sortedLaptimes;
  };
}

module.exports = LaptimeMath;
