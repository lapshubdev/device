/*
********INFO***********
As of 10.25.2023 this driver is only compatible with BerryGPS IMUv3.
If other sensor chips will be used, we will need to account for detection of the chip type in this module.
*/

const EventEmitter = require("events");
// GYROSCOPE
const i2c = require("i2c-bus");
const bus = i2c.openSync(1); // 1 indicates /dev/i2c-1
const DEVICE_ADDRESS = 0x6a; // Address of your gyro sensor
const LIS3MDL_ADDRESS = 0x1c;
const LIS3MDL_WHO_AM_I = 0x0f;
const LIS3MDL_CTRL_REG1 = 0x20;
const LIS3MDL_CTRL_REG2 = 0x21;
const LIS3MDL_CTRL_REG3 = 0x22;
const LIS3MDL_CTRL_REG4 = 0x23;
const LIS3MDL_CTRL_REG5 = 0x24;
const LIS3MDL_STATUS_REG = 0x27;
const LIS3MDL_OUT_X_L = 0x28;
const LIS3MDL_OUT_X_H = 0x29;
const LIS3MDL_OUT_Y_L = 0x2a;
const LIS3MDL_OUT_Y_H = 0x2b;
const LIS3MDL_OUT_Z_L = 0x2c;
const LIS3MDL_OUT_Z_H = 0x2d;
const LIS3MDL_TEMP_OUT_L = 0x2e;
const LIS3MDL_TEMP_OUT_H = 0x2f;
const LIS3MDL_INT_CFG = 0x30;
const LIS3MDL_INT_SRC = 0x31;
const LIS3MDL_INT_THS_L = 0x32;
const LIS3MDL_INT_THS_H = 0x33;
const LSM6DSL_ADDRESS = 0x6a;
const LSM6DSL_WHO_AM_I = 0x0f;
const LSM6DSL_RAM_ACCESS = 0x01;
const LSM6DSL_CTRL1_XL = 0x10;
const LSM6DSL_CTRL8_XL = 0x17;
const LSM6DSL_CTRL2_G = 0x11;
const LSM6DSL_CTRL10_C = 0x19;
const LSM6DSL_TAP_CFG1 = 0x58;
const LSM6DSL_INT1_CTR = 0x0d;
const LSM6DSL_CTRL3_C = 0x12;
const LSM6DSL_CTRL4_C = 0x13;

const LSM6DSL_STEP_COUNTER_L = 0x4b;
const LSM6DSL_STEP_COUNTER_H = 0x4c;

const LSM6DSL_OUTX_L_XL = 0x28;
const LSM6DSL_OUTX_H_XL = 0x29;
const LSM6DSL_OUTY_L_XL = 0x2a;
const LSM6DSL_OUTY_H_XL = 0x2b;
const LSM6DSL_OUTZ_L_XL = 0x2c;
const LSM6DSL_OUTZ_H_XL = 0x2d;

const LSM6DSL_OUT_L_TEMP = 0x20;
const LSM6DSL_OUT_H_TEMP = 0x21;

const LSM6DSL_OUTX_L_G = 0x22;
const LSM6DSL_OUTX_H_G = 0x23;
const LSM6DSL_OUTY_L_G = 0x24;
const LSM6DSL_OUTY_H_G = 0x25;
const LSM6DSL_OUTZ_L_G = 0x26;
const LSM6DSL_OUTZ_H_G = 0x27;

const LSM6DSL_TAP_CFG = 0x58;
const LSM6DSL_WAKE_UP_SRC = 0x1b;
const LSM6DSL_WAKE_UP_DUR = 0x5c;
const LSM6DSL_FREE_FALL = 0x5d;
const LSM6DSL_MD1_CFG = 0x5e;
const LSM6DSL_MD2_CFG = 0x5f;
const LSM6DSL_TAP_THS_6D = 0x59;
const LSM6DSL_INT_DUR2 = 0x5a;
const LSM6DSL_WAKE_UP_THS = 0x5b;
const LSM6DSL_FUNC_SRC1 = 0x53;

class Gyroscope {
  #data;
  #intervalTimer;

  constructor() {
    this.data = new EventEmitter.EventEmitter();
    console.log("[GYRO] - started the module.");
  }

  // acc X
  #readACCx = () => {
    const acc_l = bus.readByteSync(DEVICE_ADDRESS, LSM6DSL_OUTX_L_XL);
    const acc_h = bus.readByteSync(DEVICE_ADDRESS, LSM6DSL_OUTX_H_XL);
    //const high = bus.readByteSync(DEVICE_ADDRESS, reg);
    //const low = bus.readByteSync(DEVICE_ADDRESS, reg + 1);
    //const value = (high << 8) + low;
    const acc_combined = (acc_h << 8) + acc_l;
    //if (acc_combined < 32768) acc_combined = acc_combined-65536

    //return value;
    return acc_combined;
  };

  #readACCx2C = () => {
    const val = this.#readACCx();
    return val >= 0x8000 ? -(65535 - val + 1) : val;
  };

  // acc Y
  #readACCy = () => {
    const acc_l = bus.readByteSync(DEVICE_ADDRESS, LSM6DSL_OUTY_L_XL);
    const acc_h = bus.readByteSync(DEVICE_ADDRESS, LSM6DSL_OUTY_H_XL);
    const acc_combined = (acc_h << 8) + acc_l;

    return acc_combined;
  };

  #readACCy2C = () => {
    const val = this.#readACCy();
    return val >= 0x8000 ? -(65535 - val + 1) : val;
  };

  // acc Z
  #readACCz = () => {
    const acc_l = bus.readByteSync(DEVICE_ADDRESS, LSM6DSL_OUTZ_L_XL);
    const acc_h = bus.readByteSync(DEVICE_ADDRESS, LSM6DSL_OUTZ_H_XL);
    const acc_combined = (acc_h << 8) + acc_l;

    return acc_combined;
  };

  #readACCz2C = () => {
    const val = this.#readACCz();
    return val >= 0x8000 ? -(65535 - val + 1) : val;
  };

  #getGyroData = () => {
    const ACCx = this.#readACCx2C();
    const ACCy = this.#readACCy2C();
    const ACCz = this.#readACCz2C();

    //const ACCy = this.#readWord(0x2A);
    //const ACCz = this.#readWord(0x2C);
    const x = Number(((ACCx * 0.244) / 1000).toFixed(2));
    const y = Number(((ACCy * 0.244) / 1000).toFixed(2));
    const z = Number(((ACCz * 0.244) / 1000).toFixed(2));
    //const g = Number ((this.#calculateTotalG(x, y, z)).toFixed(2))

    // Calculate the total gravity relative to the starting point
    const g = Number(Math.sqrt(x * x + y * y + z * z).toFixed(2));

    // Check if g is close to 1g and set it to 0 if it's within a tolerance
    const tolerance = 0.1; // Define your tolerance here
    const closeTo1g = Math.abs(g - 1) < tolerance;
    const adjustedG = closeTo1g ? 0 : g;

    /* We can return x, y, z and g but for now we only return total G*/
    //const tmp = { x, y, z, g };
    //console.log(tmp)
    //return { x, y, z, g };

    //return Number(g)
    //console.log(adjustedG)
    return { x, y, z, adjustedG };
  };

  #writeByte = (device_addr, reg, value) => {
    const result = bus.writeByteSync(device_addr, reg, value);
    //console.log("GYRO:")
    //console.log(result)
  };

  #calculateTotalG = (x, y, z) => {
    /*
     Calculates the total g-force given x, y, and z components.

     Args:
         x (float): X component of acceleration.
         y (float): Y component of acceleration.
         z (float): Z component of acceleration.

     Returns:
         float: Total g-force.
    */
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  };

  initHardware = () => {
    //initialise the accelerometer
    this.#writeByte(LSM6DSL_ADDRESS, LSM6DSL_CTRL1_XL, 0b10011111); // ODR 3.33 kHz, +/- 8g ,   BW = 400hz
    this.#writeByte(LSM6DSL_ADDRESS, LSM6DSL_CTRL3_C, 0b01000100); // Enable Block Data        update, increment during multi byte read

    //initialise the gyroscope
    this.#writeByte(LSM6DSL_ADDRESS, LSM6DSL_CTRL2_G, 0b10011100); // ODR 3.3 kHz, 2000 dps

    //#initialise the magnetometer
    this.#writeByte(LIS3MDL_ADDRESS, LIS3MDL_CTRL_REG1, 0b11011100);
    // Temp sesnor enabled, High performance, ODR 80 Hz, FAST ODR disabled and Selft test disabled.
    this.#writeByte(LIS3MDL_ADDRESS, LIS3MDL_CTRL_REG2, 0b00100000); // +/- 8 gauss
    this.#writeByte(LIS3MDL_ADDRESS, LIS3MDL_CTRL_REG3, 0b00000000); // Continuous-conversion   mode
    //this.#writeByte(0x6B, 0x42);
  };

  #main = () => {
    //let delta = sw.read()
    //const { gyroXOut, gyroYOut, gyroZOut } = getGyroData();
    this.data.emit("event", this.#getGyroData());
  };

  start = (interval) => {
    console.log("[GYRO] - started pulling data.");
    let data = this.data;

    this.#intervalTimer = setInterval(this.#main, interval);
  };

  stop = () => {
    console.log("[GYRO] - stoppped.");
    clearInterval(this.#intervalTimer);
  };

  getReadings = () => {
    return this.data;
  };
}

//const gyro = new Gyroscope()
//gyro.start(100)
module.exports = Gyroscope;
