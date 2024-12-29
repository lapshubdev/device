const EventEmitter = require("events");
// OBD
const OBDReader = require("serial-obd");
const options = { baudeRate: 115200 };
const serialOBDReader = new OBDReader("/dev/rfcomm0", options);

// make sure queue.length is adjusted in the obd-serial module! Line 232 in obd.js ./node_modules/serial-obd/lib/obd.js

class OBD {
  #t;
  #data;

  constructor() {
    this.data = { rpm: 0, speed: 0, temp: 0, gear: 0, throttlePos: 0 };
    this.t = new EventEmitter.EventEmitter();
  }

  start = (frequency) => {
    console.log("[OBD] - started the module.");

    let t = this.t;
    let data = this.data;

    serialOBDReader.on("dataReceived", function (d) {
      if (d.name == "rpm") data.rpm = d.value;
      if (d.name == "vss") data.speed = d.value;
      if (d.name == "throttlepos") data.throttlepos = d.value;

      t.emit("event", data);
      //if (d.name == 'temp') data.temp = d.value // this could be slower polling, no need ms updates
    });

    serialOBDReader.on("connected", function (d) {
      this.addPoller("vss");
      this.addPoller("rpm");
      this.addPoller("throttlepos");
      //this.addPoller("maf");
      this.startPolling(frequency); //Polls all added pollers each 2000 ms. Optimal 300
    });

    serialOBDReader.on("", function (test) {
      console.log(test);
    });

    serialOBDReader.connect();
  };

  stop = () => {
    console.log("[OBD] - disconnected");
    serialOBDReader.disconnect();
  };

  getReadings = () => {
    return this.t;
  };
}

module.exports = OBD;
