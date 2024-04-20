 import { Observable, Subject, BehaviorSubject } from 'rxjs';

 export class TrackDrivingService {
 	private subject = new Subject<any>();

  private gpsData = new BehaviorSubject('');
  sharedGpsData = this.gpsData.asObservable();
  
	sendClickEvent(clickType) {
  	this.subject.next(clickType);
 	}

  getClickEvent(): Observable<any>{
  	return this.subject.asObservable();
 	}

  newGpsData(data: any) {
    this.gpsData.next(data);
  }

 }
