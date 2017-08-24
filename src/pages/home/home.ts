import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';

import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { OneSignal } from '@ionic-native/onesignal';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserProvider, LocationTrackerProvider, NotificationsProvider} from '../../providers';

declare var myWindow:any;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class MainPage {

  private items: FirebaseListObservable<any[]>;
  private state: any;
  private searchDone: boolean = null;
  private noResults: boolean = false;
  public currentUser: any;
  public peopleAround: any = [];
  public userSettings: any;
  public searching: boolean = null;
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
    private notifications: NotificationsProvider,
    public platform: Platform,
  ) {

    this.state = {
      enabled: this.locationTracker.is_tracking
    }

    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();
        this.userProvider.userData.subscribe((settings) => this.userSettings = settings);
      }
    });

  }


  onToggleEnabled() {

    if(this.state.enabled){
      let that = this;
      setTimeout(function(){
        that.state.enabled = that.locationTracker.can_track;
      },300);
      this.locationTracker.startTracking(this.currentUser.uid);

    }else{
      this.locationTracker.stopTracking();
    }
  }

  findPeopleAround(){
    let _peopleAround;
    let subscribtion_is_done = false;
    let timer_is_done = false;
    let that = this;

    this.peopleAround = [];
    //delay animation to reflow less dom elements
    setTimeout(function(){
      that.searching = true;
      that.searchDone = false;
    },50);


    //Let time for animation before resolving data
    setTimeout(function(){
      timer_is_done = true;
      if(subscribtion_is_done){
        //that.searching = false;
        //that.peopleAround = _peopleAround;
        that.setPeople(_peopleAround);
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
          this.setPeople(res);
        }else{
          _peopleAround = res;
        }
      })
      .catch((err) => {
        console.error(err);
      })
  }
  filterByBuddies(users){
    if(!this.userSettings.buddies && users.length < 1){
      return [];
    }

    let myBuddies = this.userSettings.buddies;

    return users.filter((_buddy) => {
      let uid = _buddy.aFuid;
      if(myBuddies[uid] && myBuddies[uid].pending === false){
        return true;
      }else{
        return false;
      }

    })
  }

  setPeople(people){
    let that = this;
    this.searchDone = true;
    this.searching = false;
    //finish animation then print results
    //to avoid reflow slugish animation

    people.map((person) => {
      person.avatarLoaded = false;

      if(person.profileImg && person.profileImg.url != ''){
        person.avatar = person.profileImg.url;
      }else if(person.photoURL){
        person.avatar = person.photoURL;
      }else{
        person.avatar = './assets/img/man.svg';
        person.avatarLoaded = true;
      }
    })

    setTimeout(function(){
      that.noResults = (people.length == 0) ? true : false ;
      that.peopleAround = people;
    },300);
  }

  stop(){
    this.locationTracker.stopTracking();
  }

  openPage(page: any) {
    this.navCtrl.push(page);
  }

  sendMessageCloseBy(index){
    let oneSignalId = this.peopleAround[index].oneSignalId;
    let name = this.userSettings.displayName;
    let data = {
      type: 'closeBy',
      from: {
        oneSignalId: this.userSettings.oneSignalId,
        user_id: this.userSettings.aFuid
      },
      displayName: name
    };
    let contents = {
      'en': `${name} wants to let you know that is close by !`
    }
    this.notifications.sendMessage([oneSignalId], data, contents);
  }




  avatarLoaded(index){
    this.peopleAround[index].avatarLoaded = true;
  }

}
