import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-multipage-modal',
  templateUrl: 'multipage-modal.html',
})
export class MultipageModalPage {
  root: string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  activeMenu = 'MultipageModalPage';

  ionViewDidLoad() {
    console.log('ionViewDidLoad MultipageModalPage');
    this.root = 'PlacesModalPage';
    console.log('multipage', this.navCtrl);
  }

}
