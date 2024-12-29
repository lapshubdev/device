import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { Router } from '@angular/router';
import { GlobalVariables } from '../global-variables';

@Component({
  selector: 'app-trackdriving',
  templateUrl: './trackdriving.component.html',
  styleUrls: ['./trackdriving.component.scss']
})
export class TrackdrivingComponent implements OnInit, OnDestroy {
  stopwatch;
  stopwatchSub;
  gpsLight;
  gpsLightSub;
  bestLapTime = {
    lap_number: 0,
    lap_time: "",
    laptimeInMs: ""
  }

  bestLapTimeSub;
  previousLapTime;
  previousLapTimeSub;
  currentLapNumber;
  currentLapNumberSub;


  animatingFastest = false;
  animationLength;
  msg;
  msgSlow;
	msgFastest;
  msgRegular;
  msgLastlaptime;
  msgColor = "blink_me_regular" //  blink_me_red blink_me_green
  fastestLapInMs;

  obdSpeed
  obdRpm
  obdThrottlePos
  obdView = false
  lapView = true
 
	opponentBestLaptime = {
		driverName: "",
		laptime: "",
    color: "#2f3b56a8;"
	}
 
  currentView = "default"

  config;
  obdData = {speed: 0, rpm: 0, throttle_pos: 0 }
  obdDataSub;

	blinkScreen = false

  trackerId

  constructor(private socketIoService: SocketioService, private router: Router, private globals: GlobalVariables) {
    this.trackerId = this.globals.config.trackerId
    this.config = this.globals.config

    //console.log(this.config)
    this.currentView = this.config.viewMode || "default"

    this.msgFastest = this.config.msg_fastest || "FASTEST LAP"
    this.msgRegular = this.config.msg_regular || "LAP TIME"
    this.msgSlow = this.config.msg_slow || "SLOW LAP"
    this.animationLength = this.config.animation_length || 7000
  }

  ngOnInit(): void {
		if (this.globals.config.silent_mode == true) {
			this.obdView = true
			this.lapView = false

      this.currentView = "obd" || "default"
		}

    this.stopwatchSub = this.socketIoService.stopWatchData.subscribe(message => this.stopwatch = message)
    this.gpsLightSub = this.socketIoService.gpsLightData.subscribe(message => this.gpsLight = message)
    this.bestLapTimeSub = this.socketIoService.userBestLapTimeData.subscribe(message => {
			if (this.bestLapTime.laptimeInMs !== message.laptimeInMs && message.lap_number > 0) {
        this.animatingFastest = true
        this.bestLapTime.lap_time = message.lap_time
        this.bestLapTime.lap_number = message.lap_number
        this.bestLapTime.laptimeInMs = message.laptimeInMs

				this.isItSlow(message.lap_time, "fastest")
      }
		})
   
    this.previousLapTimeSub = this.socketIoService.userPreviousLapTimeData.subscribe(message => {
      if (!this.animatingFastest && message.lap_number > 0){
				this.isItSlow(message.lap_time, "normal")
      }
      this.previousLapTime = message
      this.animatingFastest = false
    })

    this.currentLapNumberSub = this.socketIoService.userCurrentLapNumberData.subscribe(message => this.currentLapNumber = message)
    this.obdDataSub = this.socketIoService.obdData.subscribe(message => {
      this.obdData = message.payload || {speed: 0, rpm: 0, throttle_pos: 0}
      this.obdSpeed = this.obdData.speed.toFixed(0)
      this.obdRpm = this.obdData.rpm
      this.obdThrottlePos = this.obdData.throttle_pos.toFixed(0)
    })
  }

  goBack() {
   this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.stopwatchSub.unsubscribe()
    this.gpsLightSub.unsubscribe()
    this.bestLapTimeSub.unsubscribe()
    this.previousLapTimeSub.unsubscribe()
    this.currentLapNumberSub.unsubscribe()
    this.obdDataSub.unsubscribe()
    // clear subs data so the old data don't appear on new session screen.
    this.socketIoService.clear()
  }

  async animateScreen() {
    this.blinkScreen = true
    setTimeout(() => {
	    this.blinkScreen = false
    }, this.animationLength)
  }

  switchViewToLaps() {
    this.obdView = false
    this.lapView = true
  }

  switchViewToObd() {
    this.obdView = true
    this.lapView = false
  }

  switchView(viewType) {
    this.currentView = viewType
  }

	opponentEvent(info) {
		let incomingLap = info

		if (incomingLap.driver){

			if (incomingLap.driver.driverId == this.trackerId) {
				this.opponentBestLaptime = { laptime: info.driver.laptime, driverName: info.driver.name, color: "#05fd0569;" } 
			}
			else {
				this.opponentBestLaptime = { laptime: info.driver.laptime, driverName: info.driver.name, color: "#ff00006e;" }
			}
		}
	}

   // adds laptimeInMs to each laptime element
	isItSlow(laptime, type) {
		if (type == "fastest") {
			this.msg = this.msgFastest 
			this.msgColor = "blink_me_green" //  blink_me_red blink_me_green
			this.msgLastlaptime = laptime

			this.animateScreen()
			
			let splittedStr = laptime.split(":")
			let splittedStrFraction = laptime.split(".")

			let minutes = Math.floor(Number(splittedStr[0]) * 60000)
			let seconds = Math.floor(Number(splittedStr[1]) * 1000)
			let milliseconds = Math.floor(Number(splittedStr[2]))
			let millisecondsFraction = Math.floor(Number(splittedStrFraction[1]))
			let sum = minutes + seconds + milliseconds + `0.${millisecondsFraction}`

			let laptimeInMs = Number(sum)
			this.fastestLapInMs = laptimeInMs

		} else {
			let splittedStr = laptime.split(":")
			let splittedStrFraction = laptime.split(".")

			let minutes = Math.floor(Number(splittedStr[0]) * 60000)
			let seconds = Math.floor(Number(splittedStr[1]) * 1000)
			let milliseconds = Math.floor(Number(splittedStr[2]))
			let millisecondsFraction = Math.floor(Number(splittedStrFraction[1]))
			let sum = minutes + seconds + milliseconds + `0.${millisecondsFraction}`

			let laptimeInMs = Number(sum)
			let laptimeInMsPercentileThreshold = this.fastestLapInMs * 0.1		
	
			if (laptimeInMs > this.fastestLapInMs + laptimeInMsPercentileThreshold) {
				console.log(laptimeInMs)
				console.log(laptimeInMsPercentileThreshold)
				// very slow
				this.msg = this.msgSlow
				this.msgColor = "blink_me_red" //  blink_me_red blink_me_green
				this.msgLastlaptime = laptime
				this.animateScreen()			
			} else {
				// regular slow
				this.msg = this.msgRegular
				this.msgColor = "blink_me_regular" //  blink_me_red blink_me_green
				this.msgLastlaptime = laptime
				this.animateScreen()
			}
		}
	}
}
