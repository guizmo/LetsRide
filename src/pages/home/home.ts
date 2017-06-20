import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
//test firbase db
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class MainPage {
  items: FirebaseListObservable<any[]>;

  constructor(
    public navCtrl: NavController,
    public afDB: AngularFireDatabase,
    public events: Events
  ) {
    this.items = afDB.list('/recipes');
  }

  goToProfile(){
    this.navCtrl.setRoot('ProfilePage');
  }

}
