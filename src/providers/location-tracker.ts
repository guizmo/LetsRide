import { Injectable, NgZone, Injector } from '@angular/core';
import { Platform } from 'ionic-angular';

import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/forkJoin';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

import { PermissionsProvider } from './permissions';
import { CloudFunctionsProvider } from './cloud-functions';
import { UtilsProvider } from './utils';
import { BuddiesProvider } from './buddies';
import * as moment  from 'moment';


@Injectable()
export class LocationTrackerProvider {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public trackerRef: AngularFireObject<any>;
  public tracker: Observable<any>;
  public trackersRef: AngularFireList<any>;
  public trackers: Observable<any>;
  public trackerSubsciption;
  public is_tracking: boolean = false;
  public isTrackingSubject = new Subject() ;
  public can_track: boolean = false;
  public canTrackSubject = new Subject() ;
  public timeTracker;
  public uid;
  private bgGeolocConf;

  private config = {
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


  constructor(
    public backgroundGeolocation: BackgroundGeolocation,
    public geolocation: Geolocation,
    public zone: NgZone,
    public platform: Platform,
    public afdb: AngularFireDatabase,
    private perm: PermissionsProvider,
    private cloudFunctions: CloudFunctionsProvider,
    public utils: UtilsProvider,
    //public buddiesProvider: BuddiesProvider
  ) {
    //console.log('is_tracking', this.is_tracking);
    this.platform.ready().then((res) => {
      this.checkLocationPermissions();
      //console.log('ready : cantrack = ', this);
    })

    this.platform.resume.subscribe((res) => {
      this.checkLocationPermissions();
      //console.log('resume : cantrack = ', this);
    })

  }

  getIsTracking(): Observable<any> {
    return this.isTrackingSubject.asObservable();
  }
  getCanTrack(): Observable<any> {
    return this.canTrackSubject.asObservable();
  }

  checkLocationPermissions(){
    //console.log('checkLocationPermissions' );
    this.perm.isLocationAuthorized().then((res) => {
      //console.log('isLocationAuthorized', res );
      let status = false;
      if(res){
        status = true;
      }
      this.checkLocationPermissionsDone(status);
    }).catch((res) => {
      let status = false;
      if(res == 'GRANTED'){
        status = true;
      }
      this.checkLocationPermissionsDone(status);
    })
  }


  checkLocationPermissionsDone(status){
    this.can_track = status;
    if(status){
      //console.log('isLocationAuthorized then success' , status);
      this.canTrackSubject.next(this.can_track);
    }else{
      //console.log('isLocationAuthorized then fail', status);
      this.canTrackSubject.next(this.can_track);
      if(this.is_tracking) this.stopTracking();
    }
  }



  startTracking(uid: string) {
    //console.log('startTracking : cantrack = ', this.can_track);
    //this.trackInBackground(uid);
    if(this.can_track){
      //console.log('startTracking => this.trackInBackground(uid)', this.can_track);
      this.trackInBackground(uid);
    }else{
      //console.log('startTracking => this.perm.showMessage()', this.can_track);
      this.is_tracking = false;
      this.perm.showMessage();
    }

  }

  trackInBackground(uid: string){
    this.uid = uid;
    this.trackerRef = this.afdb.object(`/trackers/${uid}`);
    this.tracker = this.trackerRef.snapshotChanges();
    this.timeTracker = moment();

    // Background Tracking


    if(!this.bgGeolocConf){
      this.bgGeolocConf = this.backgroundGeolocation.configure(this.config);
    }
    this.bgGeolocConf.subscribe((location) => {
      console.log('this.bgGeolocConf.subscribe', location);
      let checkTimeTracking = this.checkTimeTracking();


      if(location && checkTimeTracking){
        //console.log('has location');
        // Run update inside of Angular's zone
        this.is_tracking = true;
        this.isTrackingSubject.next(this.is_tracking);

        this.trackerRef.set({
          lat: location.latitude,
          lng: location.longitude,
          timestamp: location.time,
          timestamp_start: this.timeTracker.valueOf()
        });
      }

      if (this.platform.is('ios')) {
        this.backgroundGeolocation.finish().then((data) => console.log('finish ', data) );
      }


    });


    this.backgroundGeolocation.start().then((success) => {
      //console.log('this.backgroundGeolocation.start success', success);
    }).catch((err) => {
      //console.log('this.backgroundGeolocation.start err', err);
      if (this.platform.is('ios')) {
        this.backgroundGeolocation.finish().then((data) => console.log('finish ', data) );
      }
      this.stopTracking();

      if(err.code == 2){
        //this.backgroundGeolocation.showAppSettings();
      }
    })

  }

  checkTimeTracking(){

    if(this.timeTracker){
      let hourInMs = 3600000;
      let diff = moment().diff(this.timeTracker);
      if(diff > hourInMs){
        this.stopTracking();
        return false;
      }
      return true;
    }else{
      this.stopTracking();
      return false;
    }

  }

  stopTracking() {
    //console.log('stopTracking()');
    this.backgroundGeolocation.stop();
    this.timeTracker = null;
    this.is_tracking = false;
    this.isTrackingSubject.next(this.is_tracking);

    if(this.trackerRef){
      this.trackerRef.remove();
    }else if(this.uid){
      let tracker = this.afdb.object(`/trackers/${this.uid}`);
      if(tracker){
        tracker.remove();
      }
    }
    if(this.bgGeolocConf){
      this.bgGeolocConf = null;
    }

  }


  findPeopleAround(settings:any){
    //clean up old trackers
    this.cloudFunctions.deleteOldTrackers();

    this.trackersRef = this.afdb.list('/trackers');
    this.trackers = this.trackersRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

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
            let _trackers = data.filter( _tracker => _tracker.key !== settings.uid);
            let peopleAround = this.applyHaversine(_trackers, userLocation);

            peopleAround = peopleAround.filter( location => location.distance < distanceMax);
            peopleAround = peopleAround.sort((locationA, locationB) => locationA.distance - locationB.distance );
            peopleAround.map( (obj) => key_distance_obj[obj.key] = {distance:obj.distance, lat:obj.lat, lng:obj.lng}  );

            let buddiesRequest = [];
            if(peopleAround.length > 0){
              for(let persone of peopleAround){
                //TODO
                //buddiesRequest.push( this.afdb.object(`/users/${persone.key}`, { preserveSnapshot: true }).first() );
                buddiesRequest.push( this.afdb.object(`/users/${persone.key}`).valueChanges().first() );
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
                snapshots.map( (snapshot:any) => {
                  snapshot.location = key_distance_obj[snapshot.aFuid];
                  buddies.push(snapshot);
                });
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


  initLocation(){
    this.bgGeolocConf = this.backgroundGeolocation.configure(this.config);

    this.perm.isLocationAuthorized().then((res) => {
      console.log('initLocation then', res);
    }).catch((res) => {
      if(res == 'GRANTED') return;
      console.log('initLocation catch', res);
      //console.log(this.backgroundGeolocation);

      this.backgroundGeolocation.start().then((res) => {
        console.log('start backgroundGeolocation', this.platform.is('ios'));
        if (this.platform.is('ios')) {
          console.log('is ios call finish');
          this.backgroundGeolocation.finish();
        }
        console.log('this.backgroundGeolocation.stop');
        this.backgroundGeolocation.stop();
      });
    }).catch((err) => {
      console.log('this.backgroundGeolocation.start catch', err);
    });
  }


  applyHaversine(locations, userLocation){
    locations.map((location) => {
      let placeLocation = {
        lat: location.lat,
        lng: location.lng
      };
      location.distance = this.utils.getDistanceBetweenPoints(
        userLocation,
        placeLocation,
        'km'
      ).toFixed(2);
    });
    return locations;
  }


}
