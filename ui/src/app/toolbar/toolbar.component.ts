import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { Router } from '@angular/router';
import { GlobalVariables } from '../global-variables'

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  barMessage;
  online = false

  constructor(private socketIoService: SocketioService, private router: Router, private globals: GlobalVariables) { }

  ngOnInit(): void {
    this.socketIoService.send('gps', 'getLocation', null)

    this.socketIoService.barMessageData.subscribe(message => {
      this.barMessage = message
      this.online = true

      if(this.barMessage == "Session has started\!") {
        this.router.navigate(['/laptimes'])
      }
    })

    this.socketIoService.send('config', 'getConfig', null)

    // config pull
    this.socketIoService.configData.subscribe(message => {
      this.globals.config = message
    })
  }
}
