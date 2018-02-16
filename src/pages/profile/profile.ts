import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, MenuController } from 'ionic-angular';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { UserProvider, AlertProvider, NotificationsProvider, FileProvider, UtilsProvider, MessagesProvider } from '../../providers';

import * as firebase from 'firebase/app';
import * as moment  from 'moment';


@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  activeMenu = 'ProfilePage';
  isAnyProfile:boolean = false;
  showMap:boolean = false;
  profileViewData:any = null;
  user;
  thread;
  private ngUnsubscribe:Subject<void> = new Subject();
  private userData:any;
  private profileImg:string = null;
  private profileImgLoaded:boolean = false;
  private displayName:string = null;
  private currentUser:firebase.User;
  private emailVerified:boolean = false;
  public disciplines: ReadonlyArray<any>;
  public countries: ReadonlyArray<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    public alertProvider: AlertProvider,
    private notifications: NotificationsProvider,
    public menuCtrl: MenuController,
    private fileProvider: FileProvider,
    public utils: UtilsProvider,
    public messagesProvider: MessagesProvider
  ) {
    console.log(this);
    (!this.utils.countries) ? this.utils.getCountries().then(res => this.countries = res) : this.countries = this.utils.countries;
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;
    this.userAuth();


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
    if(this.navParams.get('isAnyProfile')){
      this.isAnyProfile = this.navParams.get('isAnyProfile');
      this.showMap = this.navParams.get('showMap');
      this.getUser();
    }

  }

  getUser(){
    if(this.userProvider.userObject){
      this.user = this.userProvider.userObject;
    }
    this.userProvider.getUser().takeWhile(user => !this.user).subscribe(user => {
      if(user){
        this.user = user;
      }
    });
  }


  ionViewDidLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMessages(){
    this.messagesProvider.getThreadId(this.user.aFuid, this.profileViewData.aFuid)
      .takeUntil(this.ngUnsubscribe)
      .subscribe( (thread:any) => {
        this.thread = {
          state: (!thread) ? 'create' : 'exist',
          threadId: (!thread) ? null : thread.threadId,
          key: this.profileViewData.aFuid,
          displayName: this.profileViewData.displayName
        }
    });
  }

  sendMessage(){
    this.navCtrl.push('MessageThreadPage', {message:this.thread, me:this.user});
  }

  openMap(){
    let data = {
      state: 'display_trackers',
      key: null,
      values: null,
      page:'MapPage',
      userId: this.currentUser.uid,
      buddy: this.profileViewData
    }
    this.modalCtrl
      .create('ModalNavPage', data)
      .present();
  }

  changeProfileImg(){
    let profileImgName = this.profileViewData.profileImg.fileName || null;
    let timestamp = moment().valueOf()+Math.floor((Math.random() * 100) + 1);
    this.fileProvider.openGallery(timestamp, this.profileViewData.settings.displayName)
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

    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { user: this.currentUser, profile: this.profileViewData.settings } );
    profileModal.onDidDismiss(profile => {
      if(profile != null && profile != 'cancel'){
        let aFuid = this.currentUser.uid;
        let userData = {...this.currentUser.providerData[0], ...{'aFuid': aFuid, settings: profile } };
        let tags = profile;
        tags.user_id = aFuid;
        this.sendUserTags(tags);
        this.userProvider.updateUserData(userData).takeUntil(this.ngUnsubscribe).subscribe((data) => {
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
    this.userProvider.afAuth.authState.takeUntil(this.ngUnsubscribe).subscribe((_user: firebase.User) => {
      if (_user) {
        this.userProvider.getUserData().takeUntil(this.ngUnsubscribe).subscribe((data) => {
          console.log('userData', data);

          if(!this.isAnyProfile){
            this.profileViewData = this.utils.buildProfile(data, this.disciplines, this.countries, _user);
          }else{
            let userData = this.navParams.get('userProfile');

            if(!userData.profileImgPath){
              this.profileViewData = this.utils.buildProfile(userData, this.disciplines, this.countries);
            }else{
              this.profileViewData = userData;
            }

            if(!this.profileViewData.location){
              this.showMap = false;
            }
            this.getMessages();
          }
          this.emailVerified = this.profileViewData.emailVerified;

          this.currentUser = _user;

          this.menuCtrl.enable(this.emailVerified, 'mainMenu');
        });
      }
    });
  }


  getDisciplinesAliases(disciplines){
    let aliases = {};
    for (let discipline of this.disciplines) {
      let _disciplines = (disciplines == '') ? [] : disciplines ;
      aliases[discipline.alias] = _disciplines.filter( disciplineVal => disciplineVal == discipline.alias )[0] || '';
    }
    return aliases;
  }
  sendUserTags(values: any) {
    let { age, city, gender, displayName, level, country } = values;
    let tags = { age, city, country, gender, user_name:displayName, user_level:level };
    let aliases = this.getDisciplinesAliases(values.disciplines);
    tags = Object.assign(tags, aliases);

    if(Object.keys(tags).length){
      this.notifications.tagUser(tags);
    }
  }

}
