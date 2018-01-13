import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

//declare var Connection;
//http://blog.ionic.io/building-an-ionic-app-with-offline-support-part-2/

@Injectable()
export class ConnectivityService {

  onDevice: boolean;

  constructor(
    public platform: Platform,
    //private network: Network
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
