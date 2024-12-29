const { deflate, inflateSync, deflateSync } = require("zlib");
const fs = require("fs");

class Compress {
  constructor() {}

  saveToDisk = async (fileName, payload) => {
    let payloadString = JSON.stringify(payload);

    deflate(payloadString, (err, buffer) => {
      if (err) {
        console.log(err);
      } else {
        let compressedPayload = buffer.toString("base64");
        fs.writeFileSync(fileName, compressedPayload, "utf-8");
      }
    });
  };

  saveToDisk2 = (fileName, payload) => {
    let payloadString = JSON.stringify(payload);
    const compressedPayload = deflateSync(payloadString);
    const compressedBase = compressedPayload.toString("base64");

    fs.writeFileSync(fileName, compressedBase, "utf-8");

    return compressedBase;
  };

  decompress = (payload) => {
    const buffer = Buffer.from(payload, "base64");
    const uncompressedPayload = inflateSync(buffer).toString();
    const scoreboardJson = JSON.parse(uncompressedPayload);

    return scoreboardJson;
  };
}

module.exports = Compress;
