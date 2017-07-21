import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Tabs } from 'ionic-angular';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider} from '../../providers';

@Component({
  selector: 'page-buddies-tabs',
  templateUrl: 'buddies-tabs.html'
})
@IonicPage()
export class BuddiesTabsPage {
  @ViewChild('buddiesTabs') tabRef: Tabs;

  /*tabsParams: {
    currentUser: Observable<any>;
    userData: Observable<any>;
  };*/
  tabsParams = new BehaviorSubject<any>(null);

  searchRoot = 'SearchPage'
  buddiesRoot = 'BuddiesPage'
  messagesRoot = 'MessagesPage'


  constructor(
    public navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider
  ) {
    let count = 0;
    this.afAuth.authState.subscribe((user) => {
      if(user){

        this.tabsParams.next({currentUser: user.toJSON()});
        count++;

        this.userProvider.userData.subscribe((settings) => {
          count++;

          if(settings){
            this.tabsParams.next({userData: settings});
            this.tabsParams.complete();
          }

        });
      }
    });
  }

  ionViewDidEnter() {
    this.tabRef.select(2);
  }

}
