import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import {OneSignal} from '@ionic-native/onesignal';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserProvider, LocationTrackerProvider, NotificationsProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class MainPage {
  private items: FirebaseListObservable<any[]>;
  public state: any;
  public currentUser: any;
  public peopleAround: any = [];



  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private afDB: AngularFireDatabase,
    private userProvider: UserProvider,
    public afAuth: AngularFireAuth,
    private nativePageTransitions: NativePageTransitions,
    public locationTracker: LocationTrackerProvider,
    private notifications: NotificationsProvider
  ) {
    //this.items = afDB.list('/recipes');
    this.state = {
      enabled: false
    }

    console.log(this);

    this.afAuth.authState.subscribe((user) => {
      this.currentUser = user.toJSON();
    });

  }

  onToggleEnabled() {
    if(this.state.enabled){
      this.locationTracker.startTracking(this.currentUser.uid);
    }else{
      this.locationTracker.stopTracking();
    }
  }

  findPeopleAround(){
    this.locationTracker.findPeopleAround({
        uid: this.currentUser.uid,
        distanceMax: 5,
      })
      .then((res) => {
        console.log(res);
        this.peopleAround = res;
      })
      .catch((err) => {
        console.error(err);
      })
  }

  stop(){
    this.locationTracker.stopTracking();
  }

  openPage(page: any) {
    let options: NativeTransitionOptions = {
       direction: 'left',
       duration: 200,
       slowdownfactor: 3,
       slidePixels: 0,
       iosdelay: 100,
       androiddelay: 150,
       fixedPixelsTop: 0,
       fixedPixelsBottom: 0
      };
    //this.nativePageTransitions.slide(options);
    this.navCtrl.push(page);
  }

  sendMessage(index){
    let oneSignalId = this.peopleAround[index].oneSignalId;
    this.notifications.sendMessage(oneSignalId);
  }

}
