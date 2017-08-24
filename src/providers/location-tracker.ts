import { Injectable, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';

import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

import { PermissionsProvider } from './permissions';

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class LocationTrackerProvider {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public tracker: FirebaseObjectObservable<any>;
  public trackers: FirebaseListObservable<any>;
  public trackerSubsciption;
  public is_tracking: boolean = false;
  public can_track: boolean = false;


  constructor(
    public backgroundGeolocation: BackgroundGeolocation,
    public geolocation: Geolocation,
    public zone: NgZone,
    public platform: Platform,
    public afdb: AngularFireDatabase,
    private perm: PermissionsProvider
  ) {
    console.log(this);
    console.log('is_tracking', this.is_tracking);

    this.platform.ready().then((res) => {
      this.checkLocationPermissions();
      console.log('ready : cantrack = ', this.can_track);
    })

    this.platform.resume.subscribe((res) => {
      this.checkLocationPermissions();
      console.log('resume : cantrack = ', this.can_track);
    })

  }

  checkLocationPermissions(){
    this.perm.isLocationAuthorized().then((res) => {
      if(res){
      console.log('isLocationAuthorized then success' , res);
      this.can_track = true;
      }else{
        console.log('isLocationAuthorized then fail', res);
        this.can_track = false;
      }
    }).catch((res) => {
      console.log('isLocationAuthorized catch', res);
      this.can_track = false;
    })
  }




  startTracking(uid: string) {
    console.log('startTracking : cantrack = ', this.can_track);
      if(this.can_track){
        console.log('startTracking => this.trackInBackground(uid)', this.can_track);
        this.trackInBackground(uid);
      }else{
        console.log('startTracking => this.perm.showMessage()', this.can_track);
        this.is_tracking = false;
        this.perm.showMessage();
      }

  }

  trackInBackground(uid: string){
    this.tracker = this.afdb.object(`/trackers/${uid}`);

    console.log('trackInBackground', this);
    // Background Tracking
    let config = {
      desiredAccuracy: 100,
      accuracy: 100,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: false,
      interval: 5000, //android
      activityType: 'Fitness',//ios,
      pauseLocationUpdates: false, //ios
      locationProvider:0 //android
    };
    this.backgroundGeolocation.configure(config).subscribe((location) => {

      if(location){
        // Run update inside of Angular's zone
        this.is_tracking = true;
        /*this.zone.run(() => {
          this.lat = location.latitude;
          this.lng = location.longitude;
        });*/

        this.tracker.set({
          lat: location.latitude,
          lng: location.longitude
        });
      }

      if (this.platform.is('ios')) {
        this.backgroundGeolocation.finish().then((data) => console.log('finish ', data) );
      }

    });


    this.backgroundGeolocation.start().then((success) => {

    }).catch((err) => {

      if (this.platform.is('ios')) {
        this.backgroundGeolocation.finish().then((data) => console.log('finish ', data) );
      }
      this.stopTracking();

      if(err.code == 2){
        //this.backgroundGeolocation.showAppSettings();
      }
    })

  }


  stopTracking() {
    this.is_tracking = false;
    this.backgroundGeolocation.stop();
    if(this.tracker){
      this.tracker.remove();
    }

  }





  findPeopleAround(settings:any){
    this.trackers = this.afdb.list('/trackers');
    return new Promise<any>( (resolve, reject) => {

      this.geolocation.getCurrentPosition().then((position) => {
        settings.lat = position.coords.latitude;
        settings.lng = position.coords.longitude;
        let distanceMax = parseFloat(settings.distanceMax);
        let userLocation = {
          lat: settings.lat,
          lng: settings.lng
        };


        this.trackerSubsciption = this.trackers.subscribe(data => {
          if(data){
            let key_distance_obj = {};
            let _trackers = data.filter( _tracker => _tracker.$key !== settings.uid);
            let peopleAround = this.applyHaversine(_trackers, userLocation);
            peopleAround = peopleAround.filter( location => location.distance < distanceMax);
            peopleAround = peopleAround.sort((locationA, locationB) => locationA.distance - locationB.distance );
            peopleAround.map( (obj) => key_distance_obj[obj.$key] = obj.distance );

            let buddiesRequest = [];
            if(peopleAround.length > 0){
              for(let persone of peopleAround){
                buddiesRequest.push( this.afdb.object(`/users/${persone.$key}`, { preserveSnapshot: true }).first() );
              }
            }else{
              return resolve([]);
            }

            if(buddiesRequest.length == 0){
              return resolve([]);
            }

            let buddies = [];
            Observable.forkJoin(buddiesRequest).subscribe((snapshots) => {
              if(snapshots){
                let snapshotsMaped:any = snapshots.map( (snap:any) => snap.val() );
                for (let snapshot of snapshotsMaped) {
                  if(snapshot){
                    let profileImg = (snapshot.profileImg && snapshot.profileImg.url) ? snapshot.profileImg.url : null;
                    let buddy = {
                      displayName: snapshot.settings.displayName,
                      aFuid: snapshot.aFuid,
                      oneSignalId: snapshot.oneSignalId || null,
                      buddies: snapshot.buddies || null,
                      photoURL: snapshot.photoURL || profileImg || null,
                      distance: key_distance_obj[snapshot.aFuid]
                    }
                    buddies.push(buddy);
                  }
                }

                resolve(buddies);
                this.trackerSubsciption.unsubscribe();
              }else{
                resolve([]);
              }
            });

          }else{
            resolve([]);
          }
        });

      })
      .catch((error) => {
        reject(error);
      })

    });// Promise
  }





  applyHaversine(locations, userLocation){
    locations.map((location) => {
      let placeLocation = {
        lat: location.lat,
        lng: location.lng
      };
      location.distance = this.getDistanceBetweenPoints(
        userLocation,
        placeLocation,
        'km'
      ).toFixed(2);
    });
    return locations;
  }
  getDistanceBetweenPoints(start, end, units){
    let earthRadius = {
        miles: 3958.8,
        km: 6371
    };
    let R = earthRadius[units || 'miles'];
    let lat1 = start.lat;
    let lon1 = start.lng;
    let lat2 = end.lat;
    let lon2 = end.lng;
    let dLat = this.toRad((lat2 - lat1));
    let dLon = this.toRad((lon2 - lon1));
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  }

  toRad(x){
    return x * Math.PI / 180;
  }


}
