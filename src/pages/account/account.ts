import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';

import { UserProvider, LoadingProvider, AlertProvider } from '../../providers';
import { Profile } from '../../models/profile';

/**
 * Generated class for the AccountPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  profileObserver;
  userObserver;
  currentUser: Profile;
  providerId: string = null;
  emailVerified: boolean = false;
  private alert;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public loadingProvider: LoadingProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public alertProvider: AlertProvider
  ) {
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



  subscribeToProfile(){
    this.profileObserver = this.userProvider.currentProfile.subscribe(
      (data) => {
        if(data){
          this.currentUser = data;
          this.providerId = data.providerId;
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



  presentAccountModal(field) {
    let modal = this.modalCtrl.create('AccountEditModalPage', {
      user: this.currentUser,
      field
    })
    modal.present();
    modal.onDidDismiss(data => {
      if(data != null && data != 'cancel'){
        if(field == 'password'){
          this.userProvider.updatePassword(data.currentPassword, data.newPassword);
        }
        if(field == 'email'){
          this.confirmEmailUpdate(data.email);
        }
      }
    })
  }


  confirmEmailUpdate(email){
    const confirmMessages = this.alertProvider.comfirmMessages;
    this.alert = this.alertCtrl.create({
      title: confirmMessages.emailUpdate.title,
      message: confirmMessages.emailUpdate.subTitle + email,
      buttons: [
        {
          text: confirmMessages.emailUpdate.back,
          handler: data => {
            console.log('No update')
          }
        },
        {
          text: confirmMessages.emailUpdate.next,
          handler: data => {
            this.userProvider.updateEmail(email)
              .then((_user) => {
                let providerData = {..._user.providerData[0], ...{'aFuid':_user.uid} };
                this.userProvider.currentProfile.next( Object.assign(providerData) );
                this.emailVerified = _user.emailVerified;
              })
              .catch((error) => {
                console.log('onDidDismiss', error)
              });


            this.emailVerified = false;
          }
        }
      ]
    }).present();

  }



  ngOnDestroy(){
    this.profileObserver.unsubscribe();
    this.userObserver.unsubscribe();
  }

}
