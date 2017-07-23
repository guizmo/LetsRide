import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the EventsModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-events-modal',
  templateUrl: 'events-modal.html',
})
export class EventsModalPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsModalPage');
  }

  addEvent(){
    let data = {
      time: 'bar',
      coords: {
        lat: -122,
        lng: 166
      },
      country: 'New caledonia',
      city: 'Nouméa',
      type: 'fooBar',
      name: 'Netcha'
    }
    this.dismiss(data);
  }

  dismiss(data:any = null) {
    this.viewCtrl.dismiss(data);
  }

}
