import { Component, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('blockTop') blockTopContainerEl: ElementRef;

  private items: FirebaseListObservable<any[]>;
  private state: any;
  private searchState: boolean = false;
  public currentUser: any;
  public peopleAround: any = [];
  public userSettings: any;
  public searching: boolean = false;
  private blockTopHeight: string = '0px';
  private search: any = {
    radius: 5,
    friends: false
  };

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
      if(user){
        this.currentUser = user.toJSON();
        this.userProvider.userData.subscribe((settings) => this.userSettings = settings);
      }
    });
  }

  ionViewDidLoad(){
    this.blockTopHeight = this.blockTopContainerEl.nativeElement.offsetHeight + 'px';
  }

  onToggleEnabled() {
    if(this.state.enabled){
      this.locationTracker.startTracking(this.currentUser.uid);
    }else{
      this.locationTracker.stopTracking();
    }
  }

  findPeopleAround(){

    this.searching = true;
    let _peopleAround;
    let subscribtion_is_done = false;
    let timer_is_done = false;
    let that = this;

    console.log(this.search);

    //Let time for animation before resolving data
    setTimeout(function(){
      timer_is_done = true;
      if(subscribtion_is_done){
        that.searching = false;
        that.searchState = true;
        that.peopleAround = _peopleAround;
      }
    },3000);

    this.locationTracker.findPeopleAround({
        uid: this.currentUser.uid,
        distanceMax: this.search.radius,
      })
      .then((res) => {
        subscribtion_is_done = true;

        if(this.search.friends){
          res = this.filterByBuddies(res);
        }

        if(timer_is_done){
          this.searching = false;
          this.peopleAround = res;
          this.searchState = true;
        }else{
          _peopleAround = res;
        }
      })
      .catch((err) => {
        console.error(err);
      })
  }
  filterByBuddies(users){

    return users.filter((_user) => {
      if(_user.buddies){
        return Object.keys(_user.buddies).filter((key, index) => {
          return this.currentUser.uid == key;
        })
      }else{
        return false;
      }
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

  sendMessageCloseBy(index){
    let oneSignalId = this.peopleAround[index].oneSignalId;
    let data = {
      type: 'closeBy',
      from: {
        oneSignalId: this.userSettings.oneSignalId,
        user_id: this.userSettings.aFuid
      },
      displayName: this.userSettings.displayName
    };
    this.notifications.sendMessage([oneSignalId], data);
  }



  fakeCloseBywithRedirect(){
    //redirect on web
    this.notifications.handleNotificationOpened({
      type: 'closeBy',
      from: {
        oneSignalId: this.userSettings.oneSignalId,
        user_id: this.userSettings.aFuid
      },
      displayName: this.userSettings.displayName
    })
  }

}
