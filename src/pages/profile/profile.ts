import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, MenuController } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';

import { UserProvider, AlertProvider } from '../../providers';
import { NotificationsProvider, FileProvider, PlacesProvider } from '../../providers';

import * as firebase from 'firebase/app';
import * as moment  from 'moment';


@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  activeMenu = 'ProfilePage';
  private userData:any;
  private profileImg:string = null;
  private profileImgLoaded:boolean = false;
  private displayName:string = null;
  private currentUser:firebase.User;
  private emailVerified:boolean = false;
  private disciplines:ReadonlyArray<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    public alertProvider: AlertProvider,
    public placesProvider: PlacesProvider,
    private notifications: NotificationsProvider,
    public menuCtrl: MenuController,
    public translateService: TranslateService,
    private fileProvider: FileProvider
  ) {
    this.userAuth();
    this.translateService.get(['DISCIPLINES']).subscribe((values) => {
      this.disciplines = values.DISCIPLINES;
    })


    if(this.navParams.data.emailVerified !== undefined){

      let emailVerified = this.navParams.data.emailVerified;
      if(!emailVerified){
        this.userProvider.checkEmailIsVerified()
          .then((res) => {
            this.emailVerified = res;
            this.alertProvider.showEmailVerifiedMessage();
            this.menuCtrl.enable(this.emailVerified, 'mainMenu');
          })
          .catch((error) => {
            console.error(error)
          });
      }
    }else{
      //not coming from SIGNUP page
      //console.log('not coming from SIGNUP page')
    }

  }

  changeProfileImg(){
    let profileImgName = this.userData.profileImg.fileName || null;
    let timestamp = moment().valueOf()+Math.floor((Math.random() * 100) + 1);
    this.fileProvider.openGallery(timestamp, this.userData.settings.displayName)
      .then((res) => {
        let data = {
          profileImg:{
            fileName: res.fileName,
            url: res.url
          }
        }
        this.userProvider.updateUserData(data);
        if(profileImgName){
          this.fileProvider.delete(profileImgName);
        }
      })
      .catch((err) => console.log(err));
  }

  uploadProfileImg(){
    //this.fileProvider.uploadImage('default.png');
  }
  getProfileImg(){
    this.fileProvider.getUrl('default.png');
  }


  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { user: this.currentUser, profile: this.userData.settings } );
    profileModal.onDidDismiss(profile => {
      if(profile != null && profile != 'cancel'){
        let aFuid = this.currentUser.uid;

        let userData = {...this.currentUser.providerData[0], ...{'aFuid': aFuid, settings: profile } };
        let tags = profile;
        tags.user_id = aFuid;
        this.sendUserTags(tags);
        this.userProvider.updateUserData(userData).subscribe((data) => {
          //TODO
          //Handle errors
          //console.log('updateUserData', data);
        });
      }
    });
    profileModal.present();
  }

  imageHasLoaded(){
    this.profileImgLoaded = true;
  }

  userAuth(){
    this.userProvider.afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.userProvider.getUserData().subscribe((data) => {
          data.settings.countryName = (data.settings && data.settings.country) ? this.placesProvider.getCountry(data.settings.country) : '';
          this.userData = data;
          this.displayName = (data.settings && data.settings.displayName) ? data.settings.displayName : _user.displayName;
          if(data.profileImg && data.profileImg.url){
            this.profileImg = data.profileImg.url;
          }else if(data.photoURL){
            this.profileImg = data.photoURL;
          }else{
            this.profileImg = './assets/img/man.svg';
          }
        });
        this.emailVerified =  (_user.providerData[0].providerId == 'facebook.com') ? true : _user.emailVerified;
        this.currentUser = _user;
        this.menuCtrl.enable(this.emailVerified, 'mainMenu');
      }
    });
  }


  sendUserTags(values: any) {
    let { age, city, gender, displayName, level, country } = values;
    let tags = { age, city, country, gender, user_name:displayName, user_level:level };
    for (let discipline of this.disciplines) {
      let _disciplines = (values.disciplines == '') ? [] : values.disciplines ;
      tags[discipline.alias] = _disciplines.filter( disciplineVal => disciplineVal == discipline.name )[0] || '';
    }
    if(Object.keys(tags).length){
      this.notifications.tagUser(tags);
    }
  }

}
