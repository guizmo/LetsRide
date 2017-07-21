import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  userData:any;
  currentUser:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
    if(this.navParams.data){
      this.navParams.data.subscribe(
        value => {
          if(value){
            let key = Object.keys(value)[0];
            this[key] = value[key];
          }
        },
        error => console.log('error'),
        () => console.log('finished')
      );
    }
  }

}
