import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { UserProvider, BuddiesProvider, FacebookProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';


@IonicPage()
@Component({
  selector: 'page-buddies',
  templateUrl: 'buddies.html',
})
export class BuddiesPage {

  currentUser;
  userData;
  buddiesId:FirebaseListObservable<any[]>;
  buddies: any = [] ;
  buddiesSubcription;
  showSpinner:boolean = true;
  showNoResult:boolean = false;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    private buddiesProvider: BuddiesProvider,
    private userProvider: UserProvider,
    private fb: FacebookProvider
  ) {
    console.log(this);
  }
  ionViewDidLeave(){
  }
  ionViewWillUnload(){
    this.buddiesSubcription.unsubscribe();
  }

  ionViewDidLoad() {
    //Fired only when a view is stored in memory. This event is NOT fired on entering a view that is already cached. It’s a nice place for init related tasks.
    this.getCurrentUser();
  }

  ionViewDidEnter() {
  }

  goto(page){
    this.navCtrl.push(page);
  }
  appInvite(){
    this.fb.appInvite();
  }

  getCurrentUser() {

    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      this.getBuddies(this.currentUser.uid);
      return;
    }else{
      this.navParams.data.subscribe((values) => {
        if(values){
          for (let key in values) {
            this[key] = values[key];
          }
          this.getBuddies(this.currentUser.uid);
          return;
        }
      });
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

  getBuddies(uid:string){
    this.buddiesProvider.getBuddies(uid);
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((buddies) => {
      this.showSpinner = false;

      this.showNoResult = (buddies.length < 1) ? true : false ;

      if(this.showNoResult){
        return;
      }

      buddies.map((_buddy) => {
        //console.log(_buddy);
        if(_buddy)
        _buddy.sortByName = _buddy.settings.displayName;

        if(_buddy.profileImg && _buddy.profileImg.url != ''){
          _buddy.avatar = _buddy.profileImg.url;
        }else if(_buddy.photoURL){
          _buddy.avatar = _buddy.photoURL;
        }else{
          _buddy.avatar = './assets/img/man.svg';
        }

      });
      this.buddies = buddies;
    })
  }


  removeFriend(index){
    let { aFuid, displayName } = this.buddies[index];

    //remove reference to request in currentUser
    let removeFromCurrentUser = this.afdb.object(`/users/${this.userData.aFuid}/buddies/${aFuid}`).remove();
    //remove reference to request from the ASKER
    let removeFromAsker = this.afdb.object(`/users/${aFuid}/buddies/${this.userData.aFuid}`).remove();

    removeFromCurrentUser
      .then(_ => console.log('success removeFromCurrentUser'))
      .catch(err => console.log(err, 'removeFromCurrentUser error!'));

    removeFromAsker
      .then(_ => console.log('success removeFromAsker'))
      .catch(err => console.log(err, 'removeFromAsker error!'));
  }

}
