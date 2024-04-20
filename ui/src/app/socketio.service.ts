import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as io from 'socket.io-client';

interface gpsPayload {
  type?: string,
  payload?: { gps_lat: any, gps_lon: any }
}

interface obdPayload {
  type?: string,
  payload?: { rpm: any, speed: any, throttle_pos: any }
}

interface scoreboardPayload {
  type?: string,
  payload?: []
}

interface fastestLap {
	lap_id?: string,
	file_name?:  string,
	gps_time?: string,
	lap_number?: number,
	lap_time?: string,
	laptimeInMs?: string,
	uploaded_to_s3?: boolean
}

interface previousLap {
	lap_number?: number,
	lap_time?: string,
}

@Injectable({
  providedIn: 'root'
})

export class SocketioService {
  socket;

  private _stopWatchData = new BehaviorSubject('');
  private _gpsLightData = new BehaviorSubject(<gpsPayload>({}));
  private _userLapTimesData = new BehaviorSubject('');
  private _userBestLapTimeData = new BehaviorSubject(<fastestLap>({}));
  private _userPreviousLapTimeData = new BehaviorSubject(<previousLap>({}));
  private _userCurrentLapNumberData = new BehaviorSubject('');
  private _barMessageData = new BehaviorSubject('');
  private _configData = new BehaviorSubject('');
  private _wifiData = new BehaviorSubject('');
  private _obdData = new BehaviorSubject(<obdPayload>({}));
  private _scoreboardData = new BehaviorSubject(<scoreboardPayload>({}));

  stopWatchData = this._stopWatchData.asObservable();
  gpsLightData = this._gpsLightData.asObservable();
  userLapTimesData = this._userLapTimesData.asObservable();
  userBestLapTimeData = this._userBestLapTimeData.asObservable();
  userPreviousLapTimeData = this._userPreviousLapTimeData.asObservable();
  userCurrentLapNumberData = this._userCurrentLapNumberData.asObservable();
  barMessageData = this._barMessageData.asObservable();
  configData = this._configData.asObservable();
  wifiData = this._wifiData.asObservable();
  obdData = this._obdData.asObservable();
  scoreboardData = this._scoreboardData.asObservable();

  constructor() {
    this.socket = io("http://127.0.0.1:4000")
    //this.socket = io("http://192.168.86.42:4000")

    this.socket.on('stopwatch', (data: any) => {
      this._stopWatchData.next(data)
    })

    this.socket.on('gpsLight', (data: gpsPayload) => {
      this._gpsLightData.next(data)
    })

    this.socket.on('userLapTimes', (data: any) => {
      this._userLapTimesData.next(data)
    })

    this.socket.on('userBestLapTime', (data: fastestLap) => {
      this._userBestLapTimeData.next(data)
    })

    this.socket.on('userPreviousLapTime', (data: previousLap) => {
      this._userPreviousLapTimeData.next(data)
    })

    this.socket.on('currentLapNumber', (data: any) => {
      this._userCurrentLapNumberData.next(data)
    })

    this.socket.on('barMessage', (data: any) => {
      this._barMessageData.next(data)
    })

    this.socket.on('configInfo', (data: any) => {
      this._configData.next(data)
    })

    this.socket.on('wifiNetworks', (data: any) => {
      this._wifiData.next(data)
    })

    this.socket.on('obd', (data: obdPayload) => {
      this._obdData.next(data)
    })

    this.socket.on('scoreboard', (data: any) => {
      this._scoreboardData.next(data)
    })
	}

  stopWatchStart() {
    this.socket.emit("stopwatch", "yiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiies")
  }

	clearObdData() {		
  	//this.socket.removeListener('obd')
    this._obdData.next(<obdPayload>({}))
	}

  clear() {
    this._userLapTimesData.next('')
    this._stopWatchData.next('')
    this._gpsLightData.next(<gpsPayload>({}))
    this._userBestLapTimeData.next(<fastestLap>({}))
    this._userPreviousLapTimeData.next(<previousLap>({}))
    this._userCurrentLapNumberData.next('')
    this._obdData.next(<obdPayload>({}))
    //this._scoreboardData.next(<scoreboardPayload>({}))
  }

  send(type, message, payload) {
    console.log("socket sending message")
    this.socket.emit(type, message, payload)
  }
}
