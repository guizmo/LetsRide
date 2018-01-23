import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';

import { UserProvider, AlertProvider } from '../../providers';



@Component({
  selector: 'gb-logout-button',
  templateUrl: 'gb-logout-button.html',
})
export class GbLogoutButton {
  logoutBtn: string;

  constructor(
    private translate: TranslateService,
    public alertCtrl: AlertController,
    public userProvider: UserProvider,
    public alertProvider: AlertProvider
  ) {
    this.logoutBtn = 'Log out';
    this.translate.get(['SIGNOUT']).subscribe( values => {
      this.logoutBtn = values.SIGNOUT;
    });
  }

  logout(){
    const confirmLogOut = this.alertProvider.confirmMessages.logOut;
    this.alertCtrl.create({
      title: confirmLogOut.title,
      message: confirmLogOut.subTitle,
      buttons: [
        {
          text: confirmLogOut.back,
          handler: data => {}
        },
        {
          text: confirmLogOut.next,
          handler: data => {
            this.userProvider.logout();
          }
        }
      ]
    }).present();
  }

}
