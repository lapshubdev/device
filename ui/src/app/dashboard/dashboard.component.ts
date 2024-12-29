import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PoweroffComponent } from '../dialogs/poweroff/poweroff.component';

export interface Tile {
    color: string;
    cols: number;
    rows: number;
    text: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  stopwatch;

	centered = false;
  disabled = false;
  unbounded = false;
  radius: number;
  colorz: string;

  constructor(private socketIoService: SocketioService, public dialog: MatDialog) {}


  shutdown() {
 		const dialogRef = this.dialog.open(PoweroffComponent)
		
		dialogRef.afterClosed().subscribe(
 			data => {
      	if (data) {
					if (data == "shutdown") {
    				this.socketIoService.send('system', 'shutdown', null)
					}
				}
			}
		)
  }

  ngOnInit(): void {
  }

  StopWatchStart() {
  }

  StopWatchStop() {
  }
}
