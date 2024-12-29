import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SocketioService } from '../../socketio.service'
import { GlobalVariables } from '../../global-variables';

export interface OpponentEvent {
	driverName?: string,
	laptime?: string,
}

@Component({
  selector: 'app-others-laptimes',
  templateUrl: './others-laptimes.component.html',
  styleUrls: ['./others-laptimes.component.scss']
})
export class OthersLaptimesComponent implements OnInit {
  @Output() onlineDriverEvent = new EventEmitter<any>()
  lapTimes = []
  lapTimesSub
  trackerId

  blink = false
  
	constructor(private socketIoService: SocketioService, private globals: GlobalVariables) {}

  ngOnInit(): void {
    this.trackerId = this.globals.config.trackerId

    this.lapTimesSub = this.socketIoService.scoreboardData.subscribe(message => {
      this.lapTimes = message.payload || []
			this.animate()
			this.onlineDriverEvent.emit({driver:  this.lapTimes[0]})
    })
  }

  async animate() {
    this.blink = true
    setTimeout(() => {
	    this.blink = false
    }, 5000)
  }


}
