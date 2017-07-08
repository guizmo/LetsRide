import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';

import { UserProvider, LoadingProvider, AlertProvider } from '../../providers';

import * as firebase from 'firebase/app';

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

  private currentUser: firebase.User;
  private emailVerified: boolean = false;
  private alert;
  private providerId: string = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    public loadingProvider: LoadingProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public alertProvider: AlertProvider
  ) {
    this.userAuth();

    console.log(this)

  }



  userAuth(){
    this.userProvider.afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.providerId = _user.providerData[0].providerId;
        this.currentUser = _user;
        if(this.providerId == 'facebook'){
          this.emailVerified = true;
        }else{
          this.emailVerified = _user.emailVerified;
        }
      }
    });
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
          handler: data => {}
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
                console.error('onDidDismiss', error);
                throw error;
              });
            this.emailVerified = false;
          }
        }
      ]
    }).present();

  }



  ngOnDestroy(){
  }

}
