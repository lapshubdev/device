const io = require("socket.io")();
const EventEmitter = require("events");

const t = new EventEmitter.EventEmitter();

start = () => {
  console.log("[SOCKET] - started the module.");

  io.on("connection", (client) => {
    console.log("[UI connection] detected");
    client.emit("broadcast", "test");

    t.emit("event", "gps", "getLocation", "getLocation");

    client.on("reply", (msg) => {
      console.log("[MSG] incoming");
      console.log(msg);
    });

    client.on("stopwatch", (msg) => {
      console.log("[MSG STOPWATCH] - incoming");
      t.emit("event", "stopwatch", "start");
      console.log(msg);
    });

    client.on("system", (msg) => {
      console.log("[MSG SYSTEM] - incoming");
      t.emit("event", "system", msg);
    });

    client.on("config", (msg, payload) => {
      console.log("[MSG CONFIG] - incoming");
      t.emit("event", "config", msg, payload);
    });

    client.on("gps", (msg, payload) => {
      console.log("[GUI] - incoming location request.");
      t.emit("event", "gps", msg, payload);
    });
  });

  io.on("disconnect", () => {
    console.log("disconnected from user");
  });

  io.listen(4000);
};

publish = (msg, type) => {
  if (msg && type) io.emit(type, msg);
};

get = () => {
  return t;
};

exports.start = start;
exports.get = get;
exports.publish = publish;
