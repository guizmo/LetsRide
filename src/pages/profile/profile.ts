import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Observable } from "rxjs/Rx";

import { UserProvider, AlertProvider } from '../../providers';
import { Profile } from '../../models/profile';


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

  editIcon: string = "create";
  editState: boolean = false;

  localProfile: any;
  allLocalProfiles: {} = null;
  displayName: string = null;
  currentUser: Profile;
  profileObserver;
  userObserver;
  emailVerified: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    public storage: Storage,
    public events: Events,
    public alertProvider: AlertProvider
  ) {
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

    this.userObserver = this.userProvider.getUser().subscribe(user => {
      if(user.providerData[0].providerId != 'password'){
        this.emailVerified = true;
      }else{
        this.emailVerified = user.emailVerified;
      }
    });

  }

  ngOnInit() {
    this.subscribeToProfile();
  }

  ngOnDestroy(){
    this.profileObserver.unsubscribe();
    this.userObserver.unsubscribe();
  }



  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { user: this.currentUser, profile: this.localProfile } );
    profileModal.onDidDismiss(profile => {
      if(profile != null && profile != 'cancel'){
        let aFuid = this.currentUser.aFuid;
        this.localProfile = profile;
        this.displayName = profile.displayName;
        this.userProvider.setLocalProfiles(profile, aFuid).then((data) => {});
      }
    });
    profileModal.present();
  }


  getLocalProfile(id){
    this.storage.get('profiles').then((data) => {
      this.localProfile = data[id];
      this.displayName = data[id].displayName;
    });
  }


  subscribeToProfile(){
    /*this.profileObserver = this.userProvider.getProfile().subscribe(
      (data) => {
        this.currentUser = data;
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("completed");
      }
    );*/

    this.profileObserver = this.userProvider.currentProfile.subscribe(
      (data) => {
        if(data){
          this.currentUser = data;
          let aFuid = data.aFuid;

          this.displayName = this.currentUser.displayName;
          this.getLocalProfile(aFuid);
        }
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("completed");
      }
    );
  }

  setDisplayName(displayName = null){
    if(this.localProfile != null){
      this.displayName = this.localProfile.displayName || this.currentUser.displayName;
    }else{
      this.displayName = displayName;
    }
  }


  listenEmailVerified(){
    this.events.subscribe('email:verified', (res) => {
      if(res){
        this.emailVerified = res;
        this.alertProvider.showEmailVerifiedMessage();
      }
    });
  }

}
