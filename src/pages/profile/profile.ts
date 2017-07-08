import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Observable } from "rxjs/Rx";

import { UserProvider, AlertProvider } from '../../providers';
import { Profile } from '../../models/profile';

import * as firebase from 'firebase/app';

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage implements OnInit, OnDestroy {
  test: string;
  private localProfile: any;
  private displayName: string = null;
  private currentUser: firebase.User;
  private emailVerified: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    public alertProvider: AlertProvider
  ) {
    this.userAuth();
    console.log('profile', this)

    let _emailVerified = this.navParams.data.emailVerified;
    if(_emailVerified !== undefined){

      let {emailVerified, displayName, aFuid } = this.navParams.data;
      //this.userProvider.setLocalProfiles({displayName, displayName}, aFuid);
      if(!emailVerified){
        this.userProvider.checkEmailIsVerified()
          .then((res) => {
            this.emailVerified = res;
            this.alertProvider.showEmailVerifiedMessage();
          })
          .catch((error) => {
            console.error(error)
          });
      }
    }else{
      //not coming from SIGNUP page
    }

  }

  ngOnInit() {
  }

  ngOnDestroy(){
  }



  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { user: this.currentUser, profile: this.localProfile } );
    profileModal.onDidDismiss(profile => {
      if(profile != null && profile != 'cancel'){
        //let aFuid = this.currentUser.aFuid;
        let aFuid = this.currentUser.uid;
        this.localProfile = profile;
        this.displayName = profile.displayName;
        this.userProvider.setLocalProfiles(profile, aFuid, true).then((data) => {});
      }
    });
    profileModal.present();
  }


  userAuth(){
    this.userProvider.afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        if(_user.providerData[0].providerId == 'facebook'){
          this.emailVerified = true;
        }else{
          this.emailVerified = _user.emailVerified;
        }
        this.currentUser = _user;
        this.userProvider.getLocalProfile(_user.uid).then((data) => {
          if(data){
            this.localProfile = data;
            this.displayName = data.displayName;
          }
        })
      }
    });
  }



}
