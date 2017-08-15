import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject'

import { UserProvider, NotificationsProvider, PeopleProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';



@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  currentUser;
  userData;
  people;
  startAt = new Subject() ;
  endAt = new Subject() ;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public userProvider: UserProvider,
    private notifications: NotificationsProvider,
    private peoplePvr: PeopleProvider
  ) {
    console.log(this);
  }

  ionViewDidLoad() {
    this.peoplePvr.getPeople(this.startAt, this.endAt)
      .subscribe(people => {
        console.log(people);

        if(people.profileImg && people.profileImg.url != ''){
          people.avatar = people.profileImg.url;
        }else if(people.photoURL){
          people.avatar = people.photoURL;
        }else{
          people.avatar = './assets/img/man.svg';
        }
        this.people = people;
      })
  }
  search($event) {
    if(!$event.target.value){
      this.people = [];
      return;
    }
    let q = this.capitalize($event.target.value);
    this.startAt.next(q);
    this.endAt.next(q+"\uf8ff");
  }

  ionViewDidEnter() {
    this.getCurrentUser();
  }

  capitalize(s){
    return s[0].toUpperCase() + s.slice(1);
  }

  onCancel(searchbar) {
    this.people = [];
  }


  getCurrentUser() {
    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      return;
    }

    this.navParams.data.subscribe(
      values => {
        if(values){
          let key = Object.keys(values)[0];
          for (let key in values) {
            this[key] = values[key];
          }
        }
      },
      error => console.log('error'),
      () => { }
    );
  }


  sendFriendRequest(key, oneSignalId, name){

    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid,
        pending: true,
      },
      displayName: name
    };

    this.notifications.sendMessage([oneSignalId], data)
      .then((res) => {
        this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);
      })
      .catch((err) => {
        if(err == 'cordova_not_available'){
          this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);
        }
      })
  }


}
