const async = require("async");
const geolib = require("geolib");
const fs = require("fs");
const tracksJson = require(
  `${process.env.HOMEPATH}/.bin/cloud-data/racetracks.json`,
);

class Laptimer {
  #finishLineCords;

  constructor(finishLine) {
    this.#finishLineCords = finishLine;
  }

  // currentCords - vehicle current Cords, finishLineCords pre-supplied
  didCrossLine = (currentCords, finishLineCords) => {
    return geolib.isPointWithinRadius(currentCords, finishLineCords, 20);
  };

  didCrossLineV2 = (currentCords, finishLineCords) => {
    //console.log(currentCords)
    //console.log(finishLineCords)
    //console.log(geolib.isPointInPolygon(currentCords, finishLineCords))
    return geolib.isPointInPolygon(currentCords, finishLineCords);
  };

  getDistance = () => {};

  getTrack = (currentCords) => {
    let numberOfConfigurations = 0;
    let iteratedNumber = 0;

    let configurableTracksAtMyLocation = [];

    for (const item of tracksJson) {
      // what if user did not activate the custom track. It should default to something, make sure you account for that
      if (item.configurable) {
        //special for tracks with different configs, i.e Autobahn CC, Mid-Ohio
        if (geolib.isPointWithinRadius(currentCords, item.finishLine, 6000)) {
          configurableTracksAtMyLocation.push(item);
        }
      } else {
        if (geolib.isPointWithinRadius(currentCords, item.finishLine, 6000)) {
          return item;
        }
      }
    }

    for (const item of configurableTracksAtMyLocation) {
      if (item.userActivated) {
        if (geolib.isPointWithinRadius(currentCords, item.finishLine, 6000)) {
          return item;
        }
      }
    }

    for (const item of configurableTracksAtMyLocation) {
      if (item.defaultTrack) {
        if (geolib.isPointWithinRadius(currentCords, item.finishLine, 6000)) {
          return item;
        }
      }
    }
  };
}

module.exports = Laptimer;
