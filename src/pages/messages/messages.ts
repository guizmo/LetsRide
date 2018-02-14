import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, BuddiesProvider, UtilsProvider } from '../../providers';

//https://www.skcript.com/svr/how-to-structure-firebase-database-for-a-scalable-chat-app/


@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

  activeMenu = 'MessagesPage';
  buddies = [];
  private ngUnsubscribe:Subject<void> = new Subject();

  constructor(
    private buddiesProvider: BuddiesProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    console.log(this);
    this.buddiesProvider.buddies.takeUntil(this.ngUnsubscribe).subscribe((buddies) => {
      this.buddies = buddies;
    });
  }
  
  ionViewDidLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
