//"use strict"
const version = "1.2a";
const fs = require("fs");
const MY_ID = fs
  .readFileSync("/var/lib/dbus/machine-id")
  .toString()
  .replace(/\n/g, "");
const async = require("async");
const crypto = require("crypto");
// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");
// in-house libraries
const Compress = require("./libs/compress/c-1");
const Cloud = require("./libs/cloud/c-2");
const socket = require("./libs/socket/s-1");
// obd
const OBD = require("./libs/obd/e-1");
const Gps = require(process.env.GPSDRIVER);
// gyro sensor
const Gyro = require("./libs/sensors/g-1");

const GpsLapTimer = require("./libs/gps/l-1");
const System = require("./libs/system/s-3");

const directoryDataPath = "/home/fd27845fce8446287de9506c4650c71/.bin/data";
const directoryRamFSPath =
  "/home/fd27845fce8446287de9506c4650c71/.bin/data-ramfs";
const directoryCloudPath =
  "/home/fd27845fce8446287de9506c4650c71/.bin/cloud-data";
const directoryReleasePath =
  "/home/fd27845fce8446287de9506c4650c71/.bin/release";
const StopWatch = require("./libs/stopwatch/s-2");
const LaptimeMath = require("./libs/math/l-2");

var time;
var fileName;

var driveLog = [];
var driveLogLapTimes = [];
var sessionLogSummary = {};

var vehicleNotAtRestCounter = 0;
var vehicleAtRestCounter = 0;
var sessionPending = false;
var sessionId, lapId;
var sessionStartTime, sessionLength;

var gps_stopwatch = 0;
var gps_stopwatchHumanReadable = 0;
var obdCurrentReading = 0;
var gCurrentReading = { x: 0, y: 0, g: 0 };
var gps_raceTrackName;
var gps_lapStartTimestamp;

const gps = new Gps();
//const gpsLaptimer = new GpsLapTimer()
const stopWatch = new StopWatch();
const obd = new OBD();
const gyro = new Gyro();
const sys = new System();
const cloud = new Cloud(
  [
    `bootbeat/updates/${MY_ID}/racetrack`,
    `bootbeat/updates/${MY_ID}/config`,
    `bootbeat/updates/${MY_ID}/scoreboard`,
    `bootbeat/bootstrap/${MY_ID}`,
  ],
  MY_ID,
);
const compression = new Compress();
const math = new LaptimeMath();

// CONFIG file
const configFilePath =
  "/home/fd27845fce8446287de9506c4650c71/.bin/cloud-data/config.json";
const racetrackFile =
  "/home/fd27845fce8446287de9506c4650c71/.bin/cloud-data/racetracks.json";

var config = require(configFilePath);
config.trackerId = MY_ID;

/* Buffers for livestream */
const bufferTrackerIDHex = Buffer.from(MY_ID, "hex");
const bufferLive = Buffer.alloc(32 + bufferTrackerIDHex.length);

stopWatch.getTime().on("event", (time) => {
  gps_stopwatch = time.time;
  gps_stopwatchHumanReadable = time.timeHuman;

  socket.publish(gps_stopwatchHumanReadable, "stopwatch");
});

obd.getReadings().on("event", (obd_data) => {
  obdCurrentReading = obd_data;
});

gyro.getReadings().on("event", (gForce) => {
  gCurrentReading = gForce;
});

function cacheToDisk(d_log, s_id) {
  return new Promise((resolve, reject) => {
    let time = new Date().getTime();
    let fileName = `${directoryRamFSPath}/${s_id}-${time}.dat`;

    fs.open(fileName, "wx", (err, fd) => {
      if (err) {
        reject(err);
      }

      fs.write(fd, d_log, (err) => {
        if (err) reject(err);
        resolve(fileName);
      });
    });
  });
}

function saveLapTimes(laptimes_log, s_id) {
  let fileName = `${directoryRamFSPath}/laptimes-${s_id}.dat`;
  fs.writeFileSync(fileName, JSON.stringify(laptimes_log), "utf-8");
}

// this executes at the end of each session, saves session summary with all lap metadata information.
// this is usually being used when vehicle is stationary, or is moving less than the config.recording_speed_threshold
function saveSessionSummary(summary_log, s_id) {
  let fileName = `${directoryRamFSPath}/summary-${s_id}.dat`;

  fs.writeFileSync(fileName, JSON.stringify(summary_log), "utf-8");
  // battery will be required
}

// this executed everytime vehicle crosses the line.
// in this function we potentially use cloud.uploadLapTelemetry to send telemetry every time we cross the line
// not sure how this would impact the laptimer's performance hence we will do this at the end of each session.
function saveLapToDisk(l_id, l_number, l_time, s_id, ignore) {
  let fileName = `${directoryRamFSPath}/${s_id}-lap${l_number}-${l_id}.dat`;
  let driveLogLastPos = driveLog.length;
  let tmpLog = [...driveLog];
  driveLog.splice(0, driveLogLastPos);

  let formattedPayload = {
    tracker_id: MY_ID,
    session_id: s_id,
    lap_id: l_id,
    lap_number: l_number,
    lap_time: l_time,
    data: tmpLog,
  };

  if (!ignore) {
    let compressed = compression.saveToDisk2(fileName, formattedPayload);

    // considering adding a conditional for special cases when event host/coach wants data after drivers crosses the line everytime
    // if (config.live_telemetry_interval < 11) { this is purely for turning off live lap telemetry to save on data charges and connection relability
    if (!config.silent_mode) {
      let lap_timeInMs = math.convertSingleLaptimeToMs(l_time);
      cloud.uploadSingleLapTelemetry(
        "telemetry-lapdata",
        compressed,
        lap_timeInMs,
        config.max_upload_laptime_length,
      );
    }
  }
  tmpLog = [];
}

function save(d_log, s_id) {
  compress.compressPayload(d_log).then((compressedPayload) => {
    cacheToDisk(compressedPayload, s_id);
  });
}

const main = () => {
  console.log("[MAIN] running");

  obdCurrentReading = { rpm: 0, speed: 0, temp: 0, gear: 0, throttlePos: 0 };
  gps_drawing_counter = 0; // limit socket.pushes for GPS cords for driving lines.
  gps_drawing_need_to_draw = true; // if we continue to draw on UI, everything becomes super slow. Only draw until crossing the line to get a full map of the racetrack

  gps_locationEstablished = false;
  gps_raceTrackName = "";

  gps_crossLine_hold = true;
  gps_lapNumber = 1;
  gps_tickCounter = 0;
  cloud_tickPushCounter = 0;

  gps_finishLine = [
    { latitude: 0, longitude: -0 },
    { latitude: 0, longitude: -0 },
    { latitude: 0, longitude: -0 },
    { latitude: 0, longitude: -0 },
  ]; //polygon, more precise
  gps_racetrackId = 0;

  const gpsLaptimer = new GpsLapTimer(gps_finishLine);

  gyro.initHardware();

  gps.getReadings().on("event", (gpsCurrentReading) => {
    gps_drawing_counter++; // counter for drawing lines on the screen + displaying and moving the gps dot
    if (gps_crossLine_hold && sessionPending) gps_tickCounter++; // counter for crossing the line to avoid multiple reports of crossed finish line
    if (config.live_telemetry && sessionPending) cloud_tickPushCounter++; // for sending live telemetry to the cloud

    let gps_time = gpsCurrentReading.time;
    let gps_time_stopwatch = gps_stopwatch;
    let gps_lat = gpsCurrentReading.lat;
    let gps_lon = gpsCurrentReading.lon;
    let gps_speed = gpsCurrentReading.speed;
    let gps_track = gpsCurrentReading.track;

    let obd_rpm = obdCurrentReading.rpm;
    let obd_speed = obdCurrentReading.speed || gps_speed;
    //let obd_speed = gps_speed
    let obd_temp = obdCurrentReading.temp;
    let obd_gear = obdCurrentReading.gear;
    let obd_throttlePos = obdCurrentReading.throttlepos || 0;

    let gyro_g = gCurrentReading;

    let geoLibCords = { latitude: gps_lat, longitude: gps_lon };

    if (config.obd_display) {
      socket.publish(
        {
          type: "obd",
          payload: {
            rpm: obd_rpm,
            speed: obd_speed,
            throttle_pos: obd_throttlePos,
          },
        },
        "obd",
      );
    }

    let payload = {
      ts: gps_time_stopwatch,
      t: gps_time,
      la: gps_lat,
      lo: gps_lon,
      s: gps_speed,
      //tr: gps_track,
      l: null,
      ln: gps_lapNumber,
      //x: gyro_g.x,
      //y: gyro_g.y,
      //z: gyro_g.z,
      g: gyro_g.adjustedG,
      o: {
        r: obd_rpm, // will come from obd reading, hardcoded for now
        s: obd_speed,
        //t: obd_temp,
        //g: obd_gear,
        t: obd_throttlePos,
      },
    };

    let publishable_payload = {
      gps_lat: gps_lat,
      gps_lon: gps_lon,
    };

    if (!gps_locationEstablished) {
      //socket.publish("Not at the racetrack", "barMessage")
      let tmpLocationData = gpsLaptimer.getTrack(geoLibCords) || false;
      if (tmpLocationData) {
        gps_locationEstablished = true;
        gps_finishLine = tmpLocationData.finishLinePolygon;
        gps_racetrackId = tmpLocationData.id;
        gps_raceTrackName = tmpLocationData.name;

        cloud.subscribe(`racetrackLive/${gps_racetrackId}/scoreboard`);
        console.log(`Welcome to ${gps_raceTrackName}!!`);

        // TODO: while waitiing for gps signial "WELCOME TO: " displays, fix it please
        console.log(gps_finishLine);

        socket.publish(`Welcome to ${gps_raceTrackName}`, "barMessage");

        cloud.publish(
          "heartbeat",
          `{"trackerId": "${MY_ID}", "racetrackId": "${gps_racetrackId}"}`,
        );

        cloud.publish(
          "bootbeat",
          `{"tracker_id": "${MY_ID}", "message": "scoreboardPlease", "racetrackID": "${gps_racetrackId}" }`,
        );

        // this is for showing where the driver is parked.
        //cloud.publishAndForget("LiveTelemetry", `{"trackerId": "${MY_ID}", "racetrackId": "${gps_racetrackId}", "speed": 15, "rpm": 5400, "lat": 99.11, "lon": 114.114}`)
      } else {
        socket.publish("Not at the racetrack", "barMessage");
      }
    }

    // for displaying gps dot on touchscreen, this draws lines too... we need to split this either in the UI or backend. What happens is that when it hits the limit
    // it stops the dot from moving on the screen in the frontend
    if (sessionPending) {
      if (gps_drawing_counter > 10 && gps_drawing_need_to_draw) {
        // 10*100ms = 1s update screen every second
        socket.publish(
          { type: "lineUpdate", payload: publishable_payload },
          "gpsLight",
        );
        gps_drawing_counter = 0;
      }

      if (gps_drawing_counter > 10 && !gps_drawing_need_to_draw) {
        socket.publish(
          { type: "markerUpdate", payload: publishable_payload },
          "gpsLight",
        );
        gps_drawing_counter = 0;
      }
    }

    if (
      cloud_tickPushCounter == config.live_telemetry_interval &&
      sessionPending
    ) {
      // for sending live telemetry, this should be configurable through config file/cloud settigns
      if (gps_stopwatch < config.live_telemetry_cutoff) {
        bufferLive.writeDoubleBE(gps_lat.toFixed(8), 0);
        bufferLive.writeDoubleBE(gps_lon.toFixed(8), 8);
        bufferLive.writeFloatBE(obd_speed.toFixed(1), 16);
        bufferLive.writeFloatBE(gyro_g.g, 20);
        bufferLive.writeBigInt64BE(BigInt(gps_time.getTime()), 24);
        bufferTrackerIDHex.copy(bufferLive, 32);
        cloud.publishAndForgetBlob("LiveTelemetry", bufferLive);
      }

      cloud_tickPushCounter = 0;
    }

    if (gps_tickCounter > config.crossline_timeout) {
      gps_crossLine_hold = false;
      gps_tickCounter = 0;
    }

    if (obd_speed < config.recording_speed_threshold * 1.609) {
      vehicleAtRestCounter++;
    } else {
      vehicleNotAtRestCounter++;
    }

    // ** SESSION ENDS
    if (vehicleAtRestCounter > 100 && sessionPending && sessionId) {
      // 100 = in this case gps sensitivity is set up to prompt every 100 ms therefore after 10 seconds at rest/end the session
      vehicleAtRestCounter = 0;
      vehicleNotAtRestCounter = 0;

      let sessionDelta = gpsCurrentReading.time - sessionStartTime;
      sessionLength = sessionDelta;

      sessionLogSummary = {
        trackerId: MY_ID,
        sessionId: sessionId,
        gpsStartTime: sessionStartTime,
        racetrackId: gps_racetrackId,
        fastestLap: driveLogLapTimes[0] || 0,
        lapTimes: driveLogLapTimes,
        sessionLength: sessionLength,
        published: false,
      };

      saveSessionSummary(sessionLogSummary, sessionId);
      sessionPending = false;
      sessionId = null;
      lapId = null;
      console.log("[SESSION] - ended.");

      stopWatch.stopTime();
      stopWatch.clearTicker();
      gyro.stop();

      gps_stopwatch = 0;
      gps_lapNumber = 1;
      driveLog = [];
      driveLogLapTimes = [];
      sessionStartTime = 0;

      socket.publish("00:00:00", "stopwatch");
      socket.publish(`Welcome to ${gps_raceTrackName}`, "barMessage");

      gps_tickCounter = 0;
      gps.decreaseHZ(); //backdown gps to 1 second
      gps_drawing_need_to_draw = true; // reset to true which is the initial value/state.

      // upload data to cloud
      try {
        cloud.uploadAllSessionTelemetry(
          "telemetry-lapdata",
          directoryRamFSPath,
          config.max_upload_laptime_length,
        );
      } catch (e) {
        console.log(e);
      }
    }
    // ** SESSION ENDS

    // ** SESSION STARTS
    if (
      vehicleNotAtRestCounter >= 5 &&
      !sessionPending &&
      !sessionId &&
      gps_lat &&
      gps_lon
    ) {
      // stop uploading any existing data to the cloud, we need full processing power to measure laptimes and telemetry
      try {
        cloud.stopUploadTimer();
      } catch (e) {
        console.log(e);
      }

      vehicleAtRestCounter = 0;
      vehicleNotAtRestCounter = 0;

      sessionPending = true;
      sessionId = generateUUID();
      lapId = generateUUID();

      console.log("[SESSION] - started.");
      sessionStartTime = gpsCurrentReading.time;
      // first lap start time
      gps_lapStartTimestamp = gpsCurrentReading.time;

      socket.publish("Session has started!", "barMessage");
      socket.publish("00:00:00", "userBestLapTime");
      socket.publish("00:00:00", "userPreviousLapTime");

      gps.increaseHZ(); //increase gps sensitivty to 100ms prompts.
      gyro.start(100); // 100ms gyro, it can do up to 33.3khz
      stopWatch.initTicker(25); // timer always at 100ms to match gps frequency. Anything less chokes the PI electron app.
      stopWatch.startTime(); // timer always at 100ms to match gps frequency. Anything less chokes the PI electron app.
    }

    if (sessionPending && sessionId) {
      // check if we crossed the finish line
      if (!gps_lapStartTimestamp)
        gps_lapStartTimestamp = gpsCurrentReading.time;

      driveLog.push(payload);

      if (
        gpsLaptimer.didCrossLineV2(geoLibCords, gps_finishLine) &&
        !gps_crossLine_hold
      ) {
        if (config.first_lap_ignore && gps_lapNumber == 1) {
          // FIRST LAP
          let lapTime =
            gps_stopwatchHumanReadable.minutes +
            ":" +
            gps_stopwatchHumanReadable.seconds +
            ":" +
            gps_stopwatchHumanReadable.miliseconds;
          payload.l = lapTime;

          saveLapToDisk(lapId, gps_lapNumber, null, sessionId, true);
          //slice the the driveLog because we fragment to file/save to disk every lap.
          gps_crossLine_hold = true;
          gps_lapNumber += 1;

          lapId = generateUUID(); // generate new lap ID after crossing the line.
          stopWatch.stopTime();
          stopWatch.startTime();
          gps_lapStartTimestamp = "";
          // ignoring first lap time, might started half way, in the middle of pit zone etc.
        } else {
          // SECOND LAP AND OTHER LAPS OVER 2
          gps_crossLine_hold = true;

          if (gps_lapNumber == 2) gps_drawing_need_to_draw = false; // after x laps stops drawing.

          let lapTime =
            gps_stopwatchHumanReadable.minutes +
            ":" +
            gps_stopwatchHumanReadable.seconds +
            ":" +
            gps_stopwatchHumanReadable.miliseconds;

          driveLogLapTimes.push({
            lap_id: lapId,
            lap_number: gps_lapNumber,
            lap_time: lapTime,
            gps_lapStartTimestamp: gps_lapStartTimestamp,
            gps_time: gps_time,
            file_name: `${sessionId}-lap${gps_lapNumber}-${lapId}.dat`,
            uploaded_to_s3: false,
          });
          payload.l = lapTime;

          let publishableLapsArr = math.sortLaptimesByTime(driveLogLapTimes);

          let publishableBestLapTime = publishableLapsArr[0] || 0;
          let publishableLapTime = {
            lap_number: gps_lapNumber,
            lap_time: lapTime,
          };

          cloud.publishAndForget(
            "LiveLaptimes",
            `{"trackerId": "${MY_ID}", "racetrackId": "${gps_racetrackId}", "lapId": "${lapId}", "lapnumber": ${gps_lapNumber} ,"laptime": "${lapTime}", "gps_lapStartTimestamp": "${gps_lapStartTimestamp.toISOString()}", "gps_time": "${gps_time.toISOString()}", "sessionId": "${sessionId}" }`,
          );
          saveLapToDisk(lapId, gps_lapNumber, lapTime, sessionId, false);

          lapId = generateUUID(); // generate new lap ID after crossing the line.
          stopWatch.stopTime();
          stopWatch.startTime();
          gps_lapStartTimestamp = "";

          socket.publish(publishableLapsArr, "userLapTimes");
          socket.publish(publishableBestLapTime, "userBestLapTime");
          socket.publish(publishableLapTime, "userPreviousLapTime");

          gps_lapNumber += 1;

          socket.publish(gps_lapNumber, "currentLapNumber");

          console.log("Crossed the line");
        }
      }
    }

    if (gps.getPowerStatus()) {
      // gps is off, send data back to the cloud
      // for now though exit gracefully
      console.log("[POWER] - turning off the device.");
      sys
        .moveCacheToSD(directoryRamFSPath, directoryDataPath)
        .then(() => {
          sys.shutdown();
        })
        .catch((e) => {
          console.log(e);
          process.exit();
        });
    }
  });
};

// **** STARTS HERE *****//

// graceful shutdown of the process
process.on("SIGINT", function () {
  console.log("[APP] - shutting down\n");

  sys
    .moveCacheToSD(directoryRamFSPath, directoryDataPath)
    .then(() => {
      gps.stop();
      process.exit();
    })
    .catch((e) => {
      console.log(e);
    });
});

console.log(`[GPS] - tracker id: ${MY_ID}`);
console.log("[GPS] - waiting for the GPS to bootup.");

//cloud.start() // start cloud connectivity, if not connectivity it will be set in the offline mode
socket.start(); // start communication between this device and user's phone

socket.get().on("event", (d, d1, d2) => {
  if (d == "stopwatch" && d1 == "start") {
    console.log("[STOPWATCH] - started");
  }

  if (d == "system" && d1 == "shutdown") {
    console.log("[SHUTDOWN] - started");
    sys
      .moveCacheToSD(directoryRamFSPath, directoryDataPath)
      .then(() => {
        sys.shutdown();
      })
      .catch((e) => {
        console.log(e);
        process.exit();
      });
  }

  if (d == "system" && d1 == "wifiList") {
    sys.wifiListAPs().then((networks) => {
      socket.publish(networks, "wifiNetworks");
    });
  }

  if (d == "config" && d1 == "wifiConnect" && d2) {
    let ssid = d2.ssid;
    let passphrase = d2.passphrase;

    console.log(`Connecting to ${ssid} with ${passphrase}`);

    if (ssid && passphrase) {
      console.log(`Connecting to ${ssid} with ${passphrase}`);
      sys
        .wifiConnect(ssid, passphrase)
        .then(() => {
          sys.wifiStatus().then((wifiStatus) => {
            console.log("Connected to wifi");
            socket.publish(wifiStatus, "wifiStatus");
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  if (d == "config" && d1 == "wifiConnectAndSave" && d2) {
    let ssid = d2.ssid;
    let passphrase = d2.passphrase;
    config.wifi_ssid = ssid;
    config.wifi_passphrase = passphrase;

    console.log(`Connecting to ${ssid} with ${passphrase}`);

    if (ssid && passphrase) {
      console.log(`Connecting to ${ssid} with ${passphrase}`);
      sys
        .wifiConnect(ssid, passphrase)
        .then(() => {
          sys.wifiStatus().then((wifiStatus) => {
            console.log("Connected to wifi");
            socket.publish(wifiStatus, "wifiStatus");

            sys.updateGlobalConfig(configFilePath, d2); // d2 is message payload, usually json
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  if (d == "config" && d1 == "getConfig") {
    config.trackerId = MY_ID;
    console.log("[CONFIG] - config message incoming.");
    console.log("send me the config");
    socket.publish(config, "configInfo");

    if (gps_locationEstablished)
      socket.publish(`Welcome to ${gps_raceTrackName}`, "barMessage");
    else socket.publish("Getting racetrack location...", "barMessage");
  }

  if (d == "config" && d1 == "updateConfig") {
    config.trackerId = MY_ID;
    console.log("[CONFIG] - update the config file.");
    console.log(d2);
    config = d2;
    sys.updateGlobalConfig(configFilePath, d2); // d2 is message payload, usually json

    // check if new version of software is available for updates
    //console.log(`[SOFTWARE UPDATES] - Checking - cloud version: ${config.backend_md5} vs our version: 1234`)
  }

  if (d == "gps" && d1 == "getLocation") {
    //socket.publish(gps_raceTrackName, 'locationInfo')
    console.log("[GUI] - asking for gps location.");
    if (gps_locationEstablished)
      socket.publish(`Welcome to ${gps_raceTrackName}`, "barMessage");
    else socket.publish("Getting racetrack location...", "barMessage");
  }

  if (d == "stopwatch" && d1 == "stop") {
  }
});

// config updates from cloud
cloud.get().on("event", (msg, payload) => {
  if (msg == `racetrackLive/${gps_racetrackId}/scoreboard`) {
    let scoreboardPayload = JSON.stringify(payload);
    let formattedScoreboard = JSON.parse(scoreboardPayload);

    try {
      let scoreboard = compression.decompress(formattedScoreboard.s);
      socket.publish({ type: "scoreboard", payload: scoreboard }, "scoreboard");
    } catch (e) {
      console.log(e);
    }
  }

  if (msg == `bootbeat/bootstrap/${MY_ID}`) {
    let formattedConfig = JSON.stringify(config);
    console.log("[CLOUD] - They want me to introduce myself.");
    cloud.publish(
      `bootbeat`,
      `{"tracker_id": "${MY_ID}", "message": "thisIsMyConfig", "config": ${formattedConfig}}`,
    );
  }

  if (msg == `bootbeat/updates/${MY_ID}/racetrack`) {
    // receiving updated racetrack db.
    console.log("[CLOUD RACETRACK DB UPDATE] - New racetrack information");

    push = async () => {
      sys.updateGlobalConfig(racetrackFile, payload); // d2 is message payload, usually json, save to file
      await cloud.publishPromised(
        "bootbeat",
        `{"tracker_id": "${MY_ID}", "message": "updatedRacetrackDB"}`,
      );

      socket.publish("Getting updates...", "barMessage");

      process.exit(); // need to reload since gps function uses json file for db information.
    };
    push();
  }

  if (msg == `bootbeat/updates/${MY_ID}/scoreboard`) {
    // receiving updated racetrack db.
    console.log("[CLOUD Scoreboard] - New scoreboard Information");
    let scoreboardPayload = JSON.stringify(payload);
    let formattedScoreboard = JSON.parse(scoreboardPayload);

    try {
      let scoreboard = compression.decompress(formattedScoreboard.s);
      console.log(scoreboard);
      console.log("published");
      socket.publish({ type: "scoreboard", payload: scoreboard }, "scoreboard");
    } catch (e) {
      console.log(e);
    }
  }

  if (msg == `bootbeat/updates/${MY_ID}/config`) {
    // receiving updated config when device was offline and new settings have been posted to the cloud.
    console.log("[CLOUD CONFIG UPDATE] - new config");

    console.log(payload);

    let backend_cur_ver = config.backend_md5;
    let backend_new_ver = payload.backend_md5;

    config = payload; // take immediate effect on the device without restarting the process.

    sys.updateGlobalConfig(configFilePath, config); // d2 is message payload, usually json

    console.log(
      `[SOFTWARE UPDATES] - Checking - our config version: ${backend_cur_ver} vs incoming cloud version: ${backend_new_ver}`,
    );

    if (backend_cur_ver !== backend_new_ver) {
      console.log(`[SOFTWARE UPDATES] - NEW BACKEND AVAILABLE, DOWNLOADING!`);
      socket.publish("Updating Software...", "barMessage");
      sys.updateSoftware(
        `${directoryReleasePath}/backend`,
        "backend",
        backend_new_ver,
      );
    } else {
      console.log(`[SOFTWARE UPDATES] - NO NEW UPDATES.`);
    }

    cloud.publish(
      "bootbeat",
      `{"tracker_id": "${MY_ID}", "message": "updatedConfig"}`,
    ); //ack-ed and send answer to cloud
  }

  if (msg == "connected") {
    console.log("[CLOUD] - Connected.");

    const timeoutObj1 = setTimeout(() => {
      cloud.publish(
        "bootbeat",
        `{"tracker_id": "${MY_ID}", "message": "amINewHere?"}`,
      );
      console.log("[CLOUD] - asking if I am new to the system.");
    }, 200);

    const timeoutObj2 = setTimeout(() => {
      cloud.publish(
        "bootbeat",
        `{"tracker_id": "${MY_ID}", "message": "anyupdates?"}`,
      );
      console.log("[CLOUD] - asking for updates.");
    }, 400);
  }
});

// -> comment out
cloud.uploadAllSessionTelemetry(
  "telemetry-lapdata",
  directoryDataPath,
  config.max_upload_laptime_length,
);
/// --> good cloud.uploadLapTelemetry("telemetry-lapdata", "/home/pi/data", "9a95d0328332d9b4ca602ecbd9f2d933", "60e00253e6b0f67f6012a27ee8451b6f")
obd.start(150);
gps.start("/dev/ttyS0");

console.log(
  `******************RACETRACKHERO VERSION: ${version}****************************`,
);

/* WIFI status for the UI and other things?
sys.wifiStatus().then((wifiStatus) => {
  console.log(wifiStatus)
  socket.publish(wifiStatus, "wifiStatus")
})
*/

main();
