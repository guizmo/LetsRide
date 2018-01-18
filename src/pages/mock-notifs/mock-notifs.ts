import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { NotificationsProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-mock-notifs',
  templateUrl: 'mock-notifs.html',
})
export class MockNotifsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private notifications: NotificationsProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MockNotifsPage', this);
  }

  sendNotif(type){
    this.notifications.mockNotifs(type);
  }
}
