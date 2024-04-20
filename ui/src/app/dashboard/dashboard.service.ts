import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class DashboardService {
	private subject = new Subject<any>();
}
