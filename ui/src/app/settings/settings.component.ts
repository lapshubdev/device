import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  config
  wifiList
  wifiScanning
  wifiSelected
  wifiPassphrase
  viewsList = [
    {"name": "Default View with GPS", "mode": "default"},
    {"name": "Competitive", "mode": "timetrials"}
  ]
  obdData = {
    rpm: 0,
    speed: 0,
    throttle_pos: 0
  }

  constructor(private router: Router, private socketIoService: SocketioService) {
    this.wifiScanning = false
  }

  ngOnInit(): void {
    console.log("Settings started")
    this.socketIoService.send('config', 'getConfig', null)

    this.socketIoService.configData.subscribe(message => {
    	this.config = message
     })
  }

  updateConfig() {
    this.socketIoService.send('config', 'updateConfig', this.config)

    if (!this.config.obd_display) {
      this.socketIoService.clearObdData() 
    }
  }

  tabAction(tab) {
    if (tab.tab.textLabel == "Network") {
      console.log("wifi list triggered")

      this.wifiScanning = true
      this.socketIoService.send('system', 'wifiList', null)

      this.socketIoService.wifiData.subscribe(message => {
        this.wifiScanning = false
        this.wifiList = message
      })
    }

    if (tab.tab.textLabel == "OBD") {
      this.socketIoService.obdData.subscribe(message => {
        if (this.config.obd_display) this.obdData = message.payload
        //console.log(message)
      })
    }
  }

  wifiConnect() {
    this.socketIoService.send('config', 'wifiConnect', {"ssid": this.wifiSelected, "passphrase": this.wifiPassphrase })
  }

  goBack() {
    this.router.navigate(['/dashboard'])
  }
}
