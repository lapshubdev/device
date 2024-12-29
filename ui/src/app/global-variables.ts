import { Injectable } from '@angular/core';
import { SocketioService } from './socketio.service';

@Injectable({	
	providedIn: 'root'
})

export class GlobalVariables {
  config

	constructor() {}

  async ngOnDestroy() {
  }
}
