import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Observable } from "rxjs/Rx";

import { UserProvider } from '../../providers';
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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    public storage: Storage
  ) {
    console.log('constructor ProfilePage', this);
  }

  ngOnInit() {
    console.log('ngOnInit ProfilePage');
    this.subscribeToProfile();
  }

  ngOnDestroy(){
    console.log('ngOnDestroy ProfilePage');
    this.profileObserver.unsubscribe();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }


  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { user: this.currentUser, profile: this.localProfile } );
    profileModal.onDidDismiss(profile => {
      console.log(this)
      let aFuid = this.currentUser.aFuid;

      this.localProfile = profile;

      this.displayName = profile.displayName;

      this.setAllLocalProfiles(profile, aFuid)
        //.then((data) => {});
    });
    profileModal.present();
  }


  getLocalProfile(id){
    this.storage.get('profiles').then((data) => {
      this.localProfile = data[id];
      this.displayName = data[id].displayName;
    });
  }

  setAllLocalProfiles(profile, id = null ){
    return this.storage.get('profiles').then((data) => {

      if(data == null){
        data = {};
      }
      data[id] = profile;
      this.storage.set('profiles', data);

      return data;
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



}
