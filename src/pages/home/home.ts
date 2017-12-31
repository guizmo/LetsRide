import { Component, ElementRef } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams, ItemSliding, Item, ItemOptions } from 'ionic-angular';

import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { OneSignal } from '@ionic-native/onesignal';

import { Subscription } from 'rxjs/Subscription';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserProvider, LocationTrackerProvider, NotificationsProvider, PermissionsProvider} from '../../providers';

declare var myWindow:any;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class MainPage {

  refresher;
  canTrackSubject: Subscription;
  isTrackingSubject: Subscription;
  activeItemSliding: ItemSliding = null;
  private onResumeSubscription;
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
    public modalCtrl: ModalController,
    private afDB: AngularFireDatabase,
    private userProvider: UserProvider,
    public afAuth: AngularFireAuth,
    private nativePageTransitions: NativePageTransitions,
    public locationTracker: LocationTrackerProvider,
    private notifications: NotificationsProvider,
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
    console.log(this);
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter', this);
    this.canTrackSubject = this.locationTracker.getCanTrack().subscribe((can_track) => {
      console.log('subscribe this.canTrackSubject', can_track);
      if(this.state.enabled && !can_track){
        this.state.enabled = can_track;
      }
    });

    this.isTrackingSubject = this.locationTracker.getIsTracking().subscribe((is_tracking) => {
      console.log('subscribe this.isTrackingSubject', is_tracking);
      if(this.locationTracker.can_track){
        this.state.enabled = is_tracking;
      }else{
        this.state.enabled = this.locationTracker.can_track;
      }
    });


  }
  ionViewWillLeave(){
    console.log('ionViewWillLeave', this);
    this.canTrackSubject.unsubscribe();
    this.isTrackingSubject.unsubscribe();
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
    },0);


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
    if(this.refresher) {
      this.refresher.complete();
      this.refresher = null;
    }

    setTimeout(function(){
      that.noResults = (people.length == 0) ? true : false ;
      that.peopleAround = people;
      that.searchDone = true;
      that.searching = false;
    },300);
  }

  stop(){
    this.locationTracker.stopTracking();
  }

  openPage(page: any) {
    this.navCtrl.push(page);
  }

  sendMessageCloseBy(index){
    this.peopleAround[index].sent = true;

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
      'en': `${name} is close by!`
    }
    this.notifications.sendMessage([oneSignalId], data, contents);
  }

  doRefresh(refresher){
    this.refresher = refresher;
    this.findPeopleAround();
  }

  openMap(index){
    let person = this.peopleAround[index];
    let modal = this.modalCtrl.create('ModalNavPage', {
      state: 'display',
      key: null,
      values: null,
      page:'MapPage',
      userId: this.currentUser.uid,
      buddy: person
    });

    modal.present();


    modal.onDidDismiss(data => {
      console.log('dismiss map', data);
    });



  }

  avatarLoaded(index){
    this.peopleAround[index].avatarLoaded = true;
  }

  closeOption() {
    if(this.activeItemSliding) {
      this.activeItemSliding.close();
      this.activeItemSliding = null;
    }
  }
  openOption(itemSlide: ItemSliding, item: Item, options) {
    if(this.activeItemSliding!==null) //use this if only one active sliding item allowed
    this.closeOption();
    this.activeItemSliding = itemSlide;

    let children = options.children;
    let totalWidth = 0;
    let swipeAmount = 160;
    itemSlide.startSliding(swipeAmount);
    itemSlide.moveSliding(swipeAmount);
    setTimeout(function() {
      for (var i = 0; i < children.length; i++) {
        totalWidth += children[i].clientWidth;
      }
      swipeAmount = totalWidth || 150; //set your required swipe amount
      itemSlide.setElementClass('active-options-right', true);
      itemSlide.setElementClass('active-swipe-right', true);
      item.setElementStyle('transition', null);
      item.setElementStyle('transform', 'translate3d(-'+swipeAmount+'px, 0px, 0px)');
    },0)

  }
}
