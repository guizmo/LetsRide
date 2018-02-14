import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { takeUntil, take, flatMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import * as moment  from 'moment';

import { UtilsProvider } from './utils';

@Injectable()
export class SearchProvider {

  public eventsRef: AngularFireList<any>;
  public events: Observable<any[]>;
  placesRef: AngularFireList<any[]>;
  places: Observable<any[]>;

  constructor(
    public afdb: AngularFireDatabase,
    private utils: UtilsProvider
  ) {
  }

  fetchEvents(myUid:string){
    let now = moment();
    this.eventsRef = this.afdb.list(`/events/`);
    this.events = this.eventsRef.snapshotChanges().take(1).flatMap( userEvents => {
      return userEvents.map(evt => {
        let data = evt.payload.val();
        const usrKey = evt.payload.key;
        if(usrKey == myUid){
          data = {};
        }
        for (let evtKey in data) {
          let eventTime = moment(data[evtKey].time);
          data[evtKey].aFuid = usrKey;
          data[evtKey].key = evtKey;
          if(data[evtKey].private || now.diff(eventTime) >= 3600000){
            delete data[evtKey];
          }
        }
        return Object.keys(data).map((k) => data[k]);
      });
    });

    return this.events;
  }

  eventNearBy(events, location_2, radius:number = 50){
    return events.filter((event) => {
      if(event.place_id){
        let placeLocation = {
          lat: event.place.lat,
          lng: event.place.lng
        };
        let distance:number = Math.ceil(this.utils.getDistanceBetweenPoints(placeLocation, location_2, 'km'));
        return distance < radius;
      }else{
        return false;
      }
    });
  }


}
