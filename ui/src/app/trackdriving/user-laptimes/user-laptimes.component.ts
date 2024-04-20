import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SocketioService } from '../../socketio.service'

@Component({
  selector: 'app-user-laptimes',
  templateUrl: './user-laptimes.component.html',
  styleUrls: ['./user-laptimes.component.scss']
})
export class UserLaptimesComponent implements OnInit, OnDestroy {
  @Input() contentHeight: string;

  lapTimes
  lapTimesSub

  constructor(private socketIoService: SocketioService) { }

  ngOnInit(): void {
    this.lapTimesSub = this.socketIoService.userLapTimesData.subscribe(message => {
      this.lapTimes = message
    })
  }
  
  ngOnDestroy(): void {
    console.log("laptimes closing")
    this.lapTimesSub.unsubscribe()
  }
}
