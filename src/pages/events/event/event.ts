import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {
  event: any = null;
  activeMenu = 'EventsPage';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.event = this.navParams.get('values');
  }

  /*ionViewDidLoad() {
    console.log(this);
  }*/

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
