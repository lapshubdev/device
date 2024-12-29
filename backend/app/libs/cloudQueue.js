const fs = require("fs");
const fse = require("fs-extra");
const async = require("async");

async function moveFile(src, dst) {
  try {
    await fse.move(src, dst);
  } catch (err) {
    console.log("error: " + err);
  }
}
const processBacklog = () => {};

exports.moveCacheToSD = (srcRam, dstSD) => {
  return new Promise((resolve, reject) => {
    fs.readdir(srcRam, function (err, files) {
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
            .move(`${srcRam}/${file}`, `${dstSD}/${file}`)
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

exports.processBacklog = processBacklog;
