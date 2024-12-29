var gpiop = require('rpi-gpio').promise;
 
gpiop.setup(7, gpiop.DIR_OUT).then(() => {
  gpiop.write(7, true)
  process.exit()
})
