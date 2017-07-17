import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Observable } from "rxjs/Rx";

import { UserProvider, AlertProvider } from '../../providers';
import { Profile } from '../../models/profile';
import { DisciplinesProvider, NotificationsProvider } from '../../providers';

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

  private userData: any;
  private displayName: string = null;
  private currentUser: firebase.User;
  private emailVerified: boolean = false;
  private disciplines: ReadonlyArray<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    public alertProvider: AlertProvider,
    public disciplinesProvider: DisciplinesProvider,
    private notifications: NotificationsProvider
  ) {
    console.log('profile', this)
    this.userAuth();
    this.disciplinesProvider.findAll().subscribe(
      data => this.disciplines = data
    );

    let _emailVerified = this.navParams.data.emailVerified;
    if(_emailVerified !== undefined){

      let {emailVerified, displayName, aFuid } = this.navParams.data;
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
      console.log('not coming from SIGNUP page')
    }

  }

  ngOnInit() {
  }

  ngOnDestroy(){
  }



  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { user: this.currentUser, profile: this.userData.settings } );
    profileModal.onDidDismiss(profile => {
      if(profile != null && profile != 'cancel'){
        let aFuid = this.currentUser.uid;

        let userData = {...this.currentUser.providerData[0], ...{'aFuid': aFuid, settings: profile } };
        this.sendDisciplinesTags(profile.disciplines);
        this.userProvider.updateUserData(userData).subscribe((data) => {
          //TODO
          //Handle errors
        });
      }
    });
    profileModal.present();
  }


  userAuth(){

    this.userProvider.afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.userProvider.userData.subscribe((data) => {
          this.userData = data;
          this.displayName = (data.settings && data.settings.displayName) ? data.settings.displayName : _user.displayName;
        });

        this.emailVerified =  (_user.providerData[0].providerId == 'facebook.com') ? true : _user.emailVerified;

        this.currentUser = _user;
      }
    });
  }


  sendDisciplinesTags(values: Array<any>) {
    if(values.length == 0 ){
      return;
    }
    let tags = {};
    for(let value of values){
      let obj = this.disciplines.filter( discipline => value == discipline.name )[0];
      tags[obj.alias] = obj.name;
    }

    console.log(Object.keys(tags).length);
    if(Object.keys(tags).length){
      this.notifications.tagUser(tags);
    }
  }

}
