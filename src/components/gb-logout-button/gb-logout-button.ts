import { Component, ViewChild } from '@angular/core';
import { Platform, ToastController, App, Events } from 'ionic-angular';

import { MainPage, ListPage} from '../../pages';

import { UserProvider, Translate } from '../../providers';
import { Dialogs } from '@ionic-native/dialogs';


/**
 * Generated class for the GbLogoutButton component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'gb-logout-button',
  templateUrl: 'gb-logout-button.html',
})
export class GbLogoutButton {
  text: string;

  constructor(
    private translate: Translate,
    public platform: Platform,
    private dialogs: Dialogs,
    public userProvider: UserProvider,
    private app: App,
    public events: Events
  ) {
    this.text = 'Log out';
  }

  logout(){
    let alertTitle = this.translate.getString('SIGNOUT_TITLE') || 'Sign out';
    let btn1 = this.translate.getString('YES') || 'Yes';
    let btn2 = this.translate.getString('NO') || 'No';
    let alertMsg = this.translate.getString('SIGNOUT_MSG') || 'Do you really want to logout';

    if (this.platform.is('cordova')) {
      this.dialogs.confirm(
        alertMsg,
        alertTitle,
        [btn1,btn2]
      )
      .then((res) => {
        if(res === 1)
          this.userProvider.logout();
      })
      .catch(e => console.log('Error displaying dialog', e));
    }else{
      this.userProvider.logout();
      this.app.getRootNav().setRoot(MainPage);
      this.events.publish('user:logout');

    }
  }

}
