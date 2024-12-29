const EventEmitter = require("events");
const SerialPort = require("serialport");
const GPS = require("gps");
const sleep = require("sleep");
const Readline = require("@serialport/parser-readline");
//const port = new SerialPort('/dev/ttyS0', { baudRate: 115200 })
const port = new SerialPort("/dev/serial0", { baudRate: 115200 });

const parser = new Readline();

class Gps {
  #t;
  #data;
  #shutdown;

  constructor() {
    this.t = new EventEmitter.EventEmitter();
  }

  #enableGps = () => {
    // echo -e -n "\xB5\x62\x06\x00\x14\x00\x01\x00\x00\x00\xD0\x08\x00\x00\x00\xC2\x01\x00\x07\x00\x03\x00\x00\x00\x00\x00\xC0\x7E" > /dev/serial0 - increase baud rate to 115200
    //console.log("Increasing baud rate")
    //port.write("\\xB5\\x62\\x06\\x00\\x14\\x00\\x01\\x00\\x00\\x00\\xD0\\x08\\x00\\x00\\x00\\xC2\\x01\\x00\\x07\\x00\\x03\\x00\\x00\\x00\\x00\\x00\\xC0\\x7E", function (err){ console.log(err)})
    //port.write('AT+CGNSPWR=1\n')
    //sleep.sleep(2)
    //port.write('AT+CGNSTST=1\n')
    //sleep.sleep(4)
    /*port.write('AT+CGNSSEQ=RMC\n', function(err){
      if (err) console.log(err)
      else {
      // enable 100ms gps response
        sleep.sleep(4)
        port.write('AT+CGNSCMD=0, "$PMTK220,1000*1F\n"');
      }
    }) */
  };

  decreaseHZ = () => {
    // "\xB5\x62\x06\x08\x06\x00\xF4\x01\x01\x00\x01\x00\x0B\x77" - 2HZ
    console.log("[GPS] - decreasing frequency to 1 second.");
    //port.write('AT+CGNSCMD=0, "$PMTK220,1000*1F\n"'); //backdown gps to 1 second
    port.write("\xB5\x62\x06\x08\x06\x00\xF4\x01\x01\x00\x01\x00\x0B\x77");
  };

  increaseHZ = () => {
    // "\xB5\x62\x06\x08\x06\x00\x64\x00\x01\x00\x01\x00\x7A\x12" - 10HZ
    console.log("[GPS] - increasing frequency to 100ms.");
    //port.write('AT+CGNSCMD=0,"$PMTK220,100*2F\n"', function (err){ console.log(err)}) // increase gps sensitivty to 100ms prompts
    port.write("\xB5\x62\x06\x08\x06\x00\x64\x00\x01\x00\x01\x00\x7A\x12");
  };

  stop = () => {
    //port.write('AT+CGNSCMD=0, "$PMTK220,1000*1F\n"'); //backdown gps to 1 second
    //port.write('AT+CGNSPWR=0\n')
    //port.write("\xB5\x62\x06\x08\x06\x00\xF4\x01\x01\x00\x01\x00\x0B\x77")
  };

  start = (devicePath) => {
    this.#enableGps();

    parser.on("data", (line) => {
      try {
        let input_data = GPS.Parse(line);

        let gps_time = input_data.time;
        let gps_lat = input_data.lat;
        let gps_lon = input_data.lon;
        let gps_speed = input_data.speed;
        let gps_track = input_data.track;

        if (input_data.type == "RMC" && gps_lat !== null && gps_lon !== null) {
          this.data = {
            time: gps_time,
            lat: gps_lat,
            lon: gps_lon,
            speed: gps_speed,
            track: gps_track,
          };
          this.t.emit("event", this.data);
        } else {
          if (line.match(/NORMAL POWER DOWN/)) this.shutdown = true; // button on the GPS module acts as a rasbperry pi shutdown button
        }
      } catch (err) {
        console.log("[GPS EXCEPTION DETECTED]");
        console.log(err);
      }
    });
    parser.on("", (line) => {
      console.log(line);
    });
    port.pipe(parser);
  };

  getReadings = () => {
    //return data
    return this.t;
  };

  getPowerStatus = () => {
    return this.shutdown;
  };
}

module.exports = Gps;
