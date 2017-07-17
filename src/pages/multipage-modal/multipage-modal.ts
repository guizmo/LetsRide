import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MultipageModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-multipage-modal',
  templateUrl: 'multipage-modal.html',
})
export class MultipageModalPage {
  root: string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MultipageModalPage');
    this.root = 'PlacesModalPage';
    console.log('multipage', this.navCtrl);
  }

}
