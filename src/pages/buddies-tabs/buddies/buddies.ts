import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { UserProvider, BuddiesProvider, FacebookProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';


@IonicPage()
@Component({
  selector: 'page-buddies',
  templateUrl: 'buddies.html',
})
export class BuddiesPage {

  currentUser;
  avatarDefault = './assets/img/man.svg';
  userData;
  buddiesId:Observable<any[]>;
  buddies: any = [] ;
  buddiesSubcription;
  showSpinner:boolean = true;
  showNoResult:boolean = false;
  activeMenu = 'BuddiesTabsPage';


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    private buddiesProvider: BuddiesProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private fb: FacebookProvider
  ) {
    //this.navCtrl.parent.select(0);
    this.fetchUserData();
  }

  fetchUserData(){
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.getBuddies(user.uid);
        this.userProvider.getUserData().subscribe((settings) => {
          if(settings){
            this.userData = settings;
            this.currentUser =  user.toJSON();
          }
        });
      }
    });
  }

  ionViewDidLeave(){ }

  ionViewWillUnload(){
    if(this.buddiesSubcription){
      this.buddiesSubcription.unsubscribe();
    }
  }

  ionViewDidLoad() {
    //Fired only when a view is stored in memory. This event is NOT fired on entering a view that is already cached. It’s a nice place for init related tasks.
    //console.log('ionViewDidLoad');
  }

  ionViewDidEnter() {
    //console.log('ionViewDidEnter getCurrentUser');
  }

  goto(page){
    this.navCtrl.push(page);
  }
  appInvite(){
    this.fb.appInvite();
  }

  updateUrl(event, index) {
    this.buddies[index].avatar = this.avatarDefault;
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
          _buddy.avatar = this.avatarDefault;
        }

      });
      this.buddies = buddies;
    })
  }


  removeFriend(index){
    let { aFuid, displayName } = this.buddies[index];

    //remove reference to request in currentUser
    this.afdb.object(`/users/${this.userData.aFuid}/buddies/${aFuid}`).remove()
      .then(_ => console.log('success removeFromCurrentUser'))
      .catch(err => console.log(err, 'removeFromCurrentUser error!'));
    //remove reference to request from the ASKER
    this.afdb.object(`/users/${aFuid}/buddies/${this.userData.aFuid}`).remove()
      .then(_ => console.log('success removeFromAsker'))
      .catch(err => console.log(err, 'removeFromAsker error!'));
  }

}
