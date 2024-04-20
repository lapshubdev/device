import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { TrackDrivingService } from './../trackdriving.service';
import { SocketioService } from '../../socketio.service';

import { tileLayer, latLng, polygon, polyline, circle } from 'leaflet';
import '@ansur/leaflet-pulse-icon';

declare let L;

@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.scss'],
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit, OnDestroy {
  clickEventsubscription:Subscription;
	private map;
	private tmpArray; latLng; playBackData; geoJSON; obd_speed; obd_rpm; obd_temp; onPlaybackTimeChange; marker; initialCordsGathered;
	private gpsCurrentCords; gpsLastCords; timeInterval; timeMsCounter; timeResult; payload; activeLines; customIcon; payloadType
  private lightDataSub

  constructor(private dashboardService: TrackDrivingService, private socketIoService: SocketioService) {

  }

	ngOnInit() {
    this.payload = {
        tracker_id: 0,
        session_id: 0,
        gps_time: 0,
        gps_lat: 0,
        gps_lon: 0,
        gps_speed: 0,
        gps_track: 0,
        obd: {
        rpm: 0, // will come from obd reading, hardcoded for now
        speed: 0,
        temp: 0,
        gear: 0,
        throttlePos: 0
        }
      }

    this.latLng = [];
  	this.gpsLastCords = [];

		this.customIcon = L.divIcon({
			iconSize: [20, 20],
			iconAnchor: [10, 10],
			popupAnchor: [10, 0],
			shadowSize: [10, 0],
			className: '.pulsating-circle'
		})

		const pulsingIcon = L.icon.pulse({iconSize:[20,20],color:'#ffffff'});
 
    this.socketIoService.userCurrentLapNumberData.subscribe(message => {
    
    })

    this.lightDataSub = this.socketIoService.gpsLightData.subscribe(message => {
      this.payload = message.payload  || {gps_lat: null, gps_lon: null}
      this.payloadType = message.type || null

			if (this.payload.gps_lat && this.payload.gps_lon && !this.initialCordsGathered) {
				this.initialCordsGathered = true

				this.map = L.map('map', {
        	//layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 50, attribution: '...' })],
          layers: [],
					center: latLng({ lat: this.payload.gps_lat, lng: this.payload.gps_lon }),
					zoom: 15,
					//zoom: 20,
					zoomSnap: 1,
					zoomControl: false,
					attributionControl: false
				})

				this.marker = L.marker(L.latLng(this.payload.gps_lat, this.payload.gps_lon), {
					icon: pulsingIcon,
					title: 'look at me!',
				}).addTo(this.map)

        this.activeLines = L.polyline(this.latLng,{
          color: '#ff4040',
          fillOpacity: 10,
          opacity: 10.0
        }).addTo(this.map)
			}

      try {

        if (this.payloadType == "lineUpdate") {
          this.activeLines.addLatLng([this.payload.gps_lat, this.payload.gps_lon])
        }

        this.gpsCurrentCords = L.latLng(this.payload.gps_lat, this.payload.gps_lon)
        this.gpsLastCords = [this.payload.gps_lat, this.payload.gps_lon]

        this.map.flyTo(this.gpsLastCords)
       
        //this.map.fitBounds(this.activeLines.getBounds()); // zoom map at my lines
        //this.map.setMaxBounds(this.activeLines.getBounds());

        this.marker.setLatLng(this.gpsLastCords).update()
      } catch (e) {}
    });
	}

  ngOnDestroy(): void {
    this.activeLines = null
    this.gpsCurrentCords = null
    this.gpsLastCords = null
    this.map = null
    this.marker = null
    this.payload = null
    this.payloadType = null

    this.lightDataSub.unsubscribe()
     
    console.log("map closing")
  }
}
