import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, MenuController } from 'ionic-angular';

import { UserProvider, LoadingProvider, AlertProvider } from '../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


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
  public activeMenu = 'AccountPage';
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    public loadingProvider: LoadingProvider,
    public afAuth: AngularFireAuth,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public alertProvider: AlertProvider,
    public menuCtrl: MenuController
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

        this.menuCtrl.enable(this.emailVerified, 'mainMenu');
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
            this.emailVerified = false;
            this.menuCtrl.enable(this.emailVerified, 'mainMenu');

            this.userProvider.updateEmail(email)
              .then((_user) => {
                this.emailVerified = _user.emailVerified;
                this.emailVerified = true;
                this.menuCtrl.enable(this.emailVerified, 'mainMenu');
              })
              .catch((error) => {
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
                if (code == 'auth/requires-recent-login') {
                  this.afAuth.auth.signOut();
                }
              });
          }
        }
      ]
    }).present();

  }



  ngOnDestroy(){
  }

}
