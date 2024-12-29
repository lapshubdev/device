// configs
const fs = require("fs");
const fse = require("fs-extra");
const async = require("async");
const sleep = require("sleep");
const _ = require("underscore");

// configs
const path = require("path");
const awsIot = require("aws-iot-device-sdk");

const EventEmitter = require("events");
const t = new EventEmitter.EventEmitter();

class Cloud {
  #iotCoreDevice;
  #trackerId;
  #uploadTimer;

  constructor(c_topics, t_id) {
    this.#iotCoreDevice = awsIot.device({
      keyPath: `${process.env.CPATH}/private.pem.key`,
      certPath: `${process.env.CPATH}/certificate.pem.crt`,
      caPath: `${process.env.CPATH}/ca.crt`,
      clientId: t_id,
      host: "av4i3hb6jgt89-ats.iot.us-east-1.amazonaws.com", // racetrackhero.com mqtt endpoint.
      keepalive: 5,
    });

    this.#trackerId = t_id;

    this.#initialize(c_topics);
  }

  publishAndForgetBlob = (topic, binaryBlob) => {
    this.#iotCoreDevice.publish(topic, binaryBlob, { qos: 0 }, function (err) {
      if (err) console.log(err);
    });
  };

  publishAndForget = (topic, message) => {
    this.#iotCoreDevice.publish(
      topic,
      JSON.stringify(message),
      { qos: 0 },
      function (err) {
        if (err) console.log(err);
      },
    );
  };

  publish = (topic, message) => {
    this.#iotCoreDevice.publish(
      topic,
      JSON.stringify(message),
      { qos: 1 },
      function (err) {
        if (err) console.log(err);
      },
    );
  };

  publishPromised = async (topic, message) => {
    this.#iotCoreDevice.publish(
      topic,
      JSON.stringify(message),
      { qos: 1 },
      function (err) {
        if (err) {
          console.log(err);
          return false;
        } else {
          console.log("[topic] - message published");
          return true;
        }
      },
    );
  };

  publishUnformattedPromised = async (topic, message) => {
    await this.#iotCoreDevice.publish(
      topic,
      message,
      { qos: 1 },
      function (err) {
        if (err) {
          console.log(err);
          return false;
        } else {
          console.log("[topic] - message published");
          return true;
        }
      },
    );
  };

  /* UPLOAD LAPs telemetry to cloud.
   * Maximum size per lap .dat file cannot be more than 128K.
   *
   * TODO:
   * If lap is more than 110K, break down the payload to 2 or more file depending on the size of the telemtry payload.
   * */

  // tell me which lap telemetry you want me to upload to the cloud.
  //
  uploadSingleLapTelemetry = (topic, lapPayload, laptimeInMs, maxLaptime) => {
    let lapDuration = laptimeInMs;
    let iot = this.#iotCoreDevice;

    // don't upload laptimes longer than 5 minutes, one day if we get to nurburgring this will need to be FIXED!!!
    if (lapDuration > maxLaptime)
      console.log(
        `Skipping ${laptimeInMs} - duration too long: ${lapDuration}`,
      );

    if (lapDuration < maxLaptime) {
      try {
        let payload = JSON.stringify(lapPayload);

        iot.publish("telemetry-lapdata", payload, { qos: 1 }, function (err) {
          if (err) console.log(err);
          else {
            try {
              console.log(`[CLOUD] - live lap uploaded to cloud successfully!`);
            } catch (e) {
              console.log(e);
            }
          }
        });
      } catch (e1) {
        console.log(e1);
      }
    }
  };

  uploadAllSessionTelemetry = (topic, dataDirectory, maxLaptime) => {
    let removeFile = this.#removeFile;
    let iot = this.#iotCoreDevice;
    let lapDBFilePath, lapPayload, sessionID, UploadedToCloud;
    UploadedToCloud = 0;

    console.log(`Max allowed lap duration: ${maxLaptime}`);

    try {
      fs.readdir(dataDirectory, function (err, files) {
        if (err) console.log(err);
        else {
          files.forEach(function (file) {
            try {
              if (file.match(/summary*/)) {
                let summaryFilePath = `${dataDirectory}/${file}`;
                let summaryDBFile = JSON.parse(
                  fs.readFileSync(`${dataDirectory}/${file}`, "utf-8"),
                );
                let summaryDBFileStringified = JSON.stringify(
                  fs.readFileSync(`${dataDirectory}/${file}`, "utf-8"),
                );
                sessionID = summaryDBFile.sessionId;

                // clean up incorrect files, empty files, no laptimes etc.
                if (summaryDBFile.lapTimes.length == 0) {
                  removeFile(summaryFilePath);
                }

                if (
                  !summaryDBFile.published &&
                  summaryDBFile.lapTimes.length > 0
                ) {
                  console.log(sessionID + " publishing summary!");
                  iot.publish(
                    "trackdata-sessionsummary",
                    summaryDBFileStringified,
                    { qos: 1 },
                    function (err) {
                      summaryDBFile.published = true;
                    },
                  );
                }

                for (let i = 0; i < summaryDBFile.lapTimes.length; i++) {
                  setTimeout(() => {
                    let lapInfo = summaryDBFile.lapTimes[i];
                    let lapFilePath = `${dataDirectory}/${lapInfo.file_name}`;
                    let lapS3 = lapInfo.uploaded_to_s3;

                    let lapDuration = lapInfo.laptimeInMs;

                    console.log(lapFilePath + " " + lapS3);

                    // don't upload laptimes longer than 5 minutes, one day if we get to nurburgring this will need to be FIXED!!!
                    if (lapDuration > maxLaptime)
                      console.log(
                        `Skipping ${lapFilePath} - duration too long: ${lapDuration}`,
                      );

                    if (lapS3 == false && lapDuration < maxLaptime) {
                      try {
                        UploadedToCloud++;
                        lapPayload = JSON.stringify(
                          fs.readFileSync(`${lapFilePath}`, "utf-8"),
                        );

                        iot.publish(
                          topic,
                          lapPayload,
                          { qos: 1 },
                          function (err) {
                            if (err) console.log(err);
                            else {
                              try {
                                console.log(summaryDBFile.lapTimes[i]);
                                summaryDBFile.lapTimes[i].uploaded_to_s3 = true;
                                console.log(
                                  `[CLOUD] - ${lapFilePath} uploaded to cloud successfully!`,
                                );
                                fs.writeFileSync(
                                  `${summaryFilePath}`,
                                  JSON.stringify(summaryDBFile),
                                );
                              } catch (e) {
                                console.log(e);
                              }
                            }
                          },
                        );
                      } catch (e1) {
                        console.log(e1);
                      }
                    }
                    // check if any laps haven't been uploaded to cloud.
                    if (
                      i == summaryDBFile.lapTimes.length - 1 &&
                      UploadedToCloud == 0
                    ) {
                      console.log(`${file} - nothing to do here.`);
                    }
                  }, 3500);
                }
              }
            } catch (e) {
              removeFile(`${dataDirectory}/${file}`);
              console.log(e);
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  uploadToCloud = (dataDirectory, topic) => {
    let iot = this.#iotCoreDevice;
    let moveFile = this.#moveFile;

    fs.readdir(dataDirectory, function (err, files) {
      //handling error
      if (err) {
        console.log("Unable to scan directory: " + err);
      }
      // listing all files using forEach
      let filesAmount = files.length;
      let i = 0;
      let sessionsProcessed = [];
      let jsonSessionsProcessed = [];

      files.forEach(function (file) {
        // read file, and push it to the cloud.
        fs.readFile(`${dataDirectory}/${file}`, (err, data) => {
          if (err) console.log(err);
          else {
            // process session segment files ID.dat
            let fileContent = data.toString(); // need to always escape "" by using stringify and convert array to string.
            let fileContentJSON = JSON.parse(fileContent);

            iot.publish(
              "trackdata-uncompressed",
              JSON.stringify(fileContent),
              { qos: 1 },
              function (err) {
                if (err) console.log(err);
                else {
                  try {
                    if (fileContentJSON.length > 40) {
                      //ignore empty sessions
                      let payload = {
                        tracker_id: fileContentJSON[10].tracker_id,
                        session_id: fileContentJSON[10].session_id,
                        date: fileContentJSON[10].gps_time.replace(/T.*/g, ""),
                      };
                      sessionsProcessed.push(payload);
                    }
                  } catch (e) {
                    console.log(e);
                  }

                  console.log(
                    `Upload of ${dataDirectory}/${file} - successful!`,
                  );
                  i++;

                  if (!file.match(/summary*/)) {
                    moveFile(
                      `${dataDirectory}/${file}`,
                      `/home/fd27845fce8446287de9506c4650c71/.bin/archive/${file}`,
                    );
                  }

                  if (i == filesAmount) {
                    let uniqueSessionsProcessed = _.uniq(
                      sessionsProcessed,
                      (x) => x.session_id,
                    );
                    console.log("Done");
                    iot.publish(
                      "trackdata-gluetogether",
                      JSON.stringify(uniqueSessionsProcessed),
                      { qos: 1 },
                      function (err) {
                        // send session summary

                        uniqueSessionsProcessed.forEach(function (session) {
                          try {
                            fs.readFile(
                              `${dataDirectory}/summary-${session.session_id}.dat`,
                              (err, sumData) => {
                                if (err) console.log(err);
                                else {
                                  let summaryContent = sumData.toString(); // need to always escape "" by using stringify and convert array to string.
                                  let summaryContentJSON =
                                    JSON.parse(summaryContent);

                                  iot.publish(
                                    "trackdata-sessionsummary",
                                    JSON.stringify(summaryContent),
                                    { qos: 1 },
                                    function (err) {
                                      if (err) console.log(err);
                                      else {
                                        console.log(
                                          `Upload of ${dataDirectory}/summary-${session.session_id}.dat - successful!`,
                                        );
                                        // archive all session files + summary files
                                        moveFile(
                                          `${dataDirectory}/summary-${session.session_id}.dat`,
                                          `/home/fd27845fce8446287de9506c4650c7/.bin/archive/summary-${session.session_id}.dat`,
                                        );
                                      }
                                    },
                                  );
                                }
                              },
                            );
                          } catch (e) {
                            console.log(e);
                          }
                        });
                      },
                    );
                  }
                }
              },
            );
          }
        });
      });
    });
  };

  #moveFile = (src, dst) => {
    fse.move(src, dst);
  };

  #removeFile = (path) => {
    console.log("Removing empty file: " + path);
    fse.remove(path);
  };

  #initialize = (c_topics) => {
    let iot = this.#iotCoreDevice;
    let trackerId = this.#trackerId;

    iot.on("error", function (err) {
      console.log(err);
    });

    iot.on("connect", function () {
      for (let i = 0; i < c_topics.length; i++) {
        iot.subscribe(c_topics[i]);
      }
      t.emit("event", "connected");
    });

    iot.on("message", function (topic, payload) {
      console.log(JSON.parse(payload));
      t.emit("event", topic, JSON.parse(payload));
    });
  };

  subscribe = (topic) => {
    let iot = this.#iotCoreDevice;
    iot.subscribe(topic);
  };

  get = () => {
    return t;
  };

  startUploadTimer = (dataDir, threshold) => {};

  stopUploadTimer = () => {
    clearInterval(this.#uploadTimer);
  };
}

module.exports = Cloud;
