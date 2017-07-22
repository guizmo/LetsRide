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

    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.userProvider.userData.subscribe((settings) => {
          if(settings){
            console.log('this.tabsParams.next({userData: settings,currentUser: user.toJSON()});');
            this.tabsParams.next({userData: settings,currentUser: user.toJSON()});
            this.tabsParams.complete();
          }
        });
      }
    });
  }

  ionViewDidEnter() {
    console.log('tabs ionViewDidLoad');
    let _self = this;
    setTimeout(function(){
      _self.tabRef.select(2);
    }, 500)

  }



}