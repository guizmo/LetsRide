import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
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


  currentUser: Profile;
  profileObserver;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public modalCtrl: ModalController
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

  etitProfile(){

    console.log(this)
    this.presentProfileModal()
  }

  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ProfileEditModalPage', { userId: 8675309 });
    profileModal.onDidDismiss(data => {
      console.log(data);
    });
    profileModal.present();
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
        this.currentUser = data;
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("completed");
      }
    );
  }

}
