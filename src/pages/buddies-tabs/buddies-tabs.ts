import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Tabs } from 'ionic-angular';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, BuddiesProvider} from '../../providers';

@Component({
  selector: 'page-buddies-tabs',
  templateUrl: 'buddies-tabs.html'
})
@IonicPage()
export class BuddiesTabsPage {
  @ViewChild('buddiesTabs') tabRef: Tabs;

  userLoaded = false;
  tabsParams = new BehaviorSubject<any>(null);

  searchRoot = 'SearchPage';
  buddiesRoot = 'BuddiesPage';
  messagesRoot = 'MessagesPage';


  constructor(
    public navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private buddiesProvider: BuddiesProvider,
    private userProvider: UserProvider
  ) {

    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.userProvider.userData.subscribe((settings) => {
          if(settings){
            this.userLoaded = true;
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
    //to redirect
    /*let _self = this;
    setTimeout(function(){
      _self.tabRef.select(2);
    }, 500)
    */
  }

  ionViewDidLeave(){
    console.log('tabs ionViewDidLeave');
    //this.buddiesProvider.buddies.complete();
  }
  ionViewWillUnload(){
    console.log('tabs ionViewWillUnload');
    //this.buddiesProvider.buddies.complete();
  }

}
