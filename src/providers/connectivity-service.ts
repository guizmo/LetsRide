import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

declare var Connection;
//http://blog.ionic.io/building-an-ionic-app-with-offline-support-part-2/
/*
  Generated class for the ConnectivityServicesProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ConnectivityService {

  onDevice: boolean;

  constructor(
    public platform: Platform,
    private network: Network
  ){
      this.onDevice = this.platform.is('cordova');

      console.log(this)
  }
  isOnline(): boolean {
    // if(this.onDevice && Network.connection){
    //     return Network.connection !== Connection.NONE;
    // } else {
    //     return navigator.onLine;
    // }
    return true;
  }
  isOffline(): boolean {
    // if(this.onDevice && Network.connection){
    //     return Network.connection === Connection.NONE;
    // } else {
    //     return !navigator.onLine;
    // }
    return true;
  }

}
