import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class MainPage {
  items: FirebaseListObservable<any[]>;

  constructor(
    public navCtrl: NavController,
    public afDB: AngularFireDatabase,
    public userProvider: UserProvider,
  ) {
    //this.items = afDB.list('/recipes');


  }



}
