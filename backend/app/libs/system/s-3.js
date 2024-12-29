const spawn = require("child_process").spawn;
const fs = require("fs");
const fse = require("fs-extra");
const async = require("async");
const iwlist = require("wireless-tools/iwlist");
const wpa_supplicant = require("wireless-tools/wpa_supplicant");
const wpa_cli = require("wireless-tools/wpa_cli");

class System {
  constructor() {}

  updateSoftware = (dir, type, md5) => {
    // TODO: add conditional for backend and frontend. For now we are just doing backend so no conditional is needed

    const update_exec = spawn(`${dir}/get-updates.sh`, [`${md5}`]);
    update_exec.unref();

    update_exec.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    update_exec.stderr.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    update_exec.on("error", (error) => {
      console.log(`error: ${error.message}`);
    });
  };

  shutdown = () => {
    const shutdown_exec = spawn("/usr/bin/sudo", ["/sbin/shutdown", "-h", "0"]);
    shutdown_exec.unref();

    shutdown_exec.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    shutdown_exec.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    shutdown_exec.on("error", (error) => {
      console.log(`error: ${error.message}`);
    });
  };

  moveCacheToSD = (src, dst) => {
    return new Promise((resolve, reject) => {
      fs.readdir(src, function (err, files) {
        //handling error
        if (err) {
          reject(err);
        }
        // listing all files using forEach
        async.eachSeries(
          files,
          function (file, callback) {
            console.log(file);
            fse
              .move(`${src}/${file}`, `${dst}/${file}`)
              .then(() => {
                console.log("success!");
                callback();
              })
              .catch((err) => {
                console.error(err);
                callback();
              });
          },
          function (err) {
            resolve();
          },
        );
      });
    });
  };

  updateGlobalConfig = (configFile, newJson) => {
    let data = JSON.stringify(newJson);

    fs.writeFileSync(configFile, data);

    return true;
  };

  /* Controls connectivity to the internet */

  wifiListAPs() {
    return new Promise((resolve, reject) => {
      iwlist.scan("wlan0", function (err, networks) {
        if (err) reject();
        else resolve(networks);
      });
    });
  }

  wifiConnect(ssid, passphrase) {
    let options = {
      interface: "wlan0",
      ssid: ssid,
      passphrase: passphrase,
      driver: "nl80211",
    };

    return new Promise((resolve, reject) => {
      wpa_supplicant.enable(options, function (err) {
        if (err) reject(err);
        else resolve("connected");
      });
    });
  }

  wifiStatus() {
    return new Promise((resolve, reject) => {
      wpa_cli.status("wlan0", function (err, wifiStatus) {
        if (err) console.log(err);
        else resolve(wifiStatus);
      });
    });
  }
}

module.exports = System;
