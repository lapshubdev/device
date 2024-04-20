import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-poweroff',
  templateUrl: './poweroff.component.html',
  styleUrls: ['./poweroff.component.scss']
})
export class PoweroffComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<PoweroffComponent>) {
    console.log("POWER OFF")
	}

  ngOnInit(): void {
  }

	async turnOff() {
		this.dialogRef.close("shutdown")
	}


	close() {
		this.dialogRef.close()
	}

}
