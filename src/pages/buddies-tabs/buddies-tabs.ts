import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Tabs, NavParams } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-buddies-tabs',
  templateUrl: 'buddies-tabs.html'
})

export class BuddiesTabsPage {
  @ViewChild('buddiesTabs') tabRef: Tabs;

  userLoaded = false;

  searchRoot = 'SearchPage';
  buddiesRoot = 'BuddiesPage';
  activeMenu = 'BuddiesTabsPage';
  tabsParams = null;


  constructor(
    public navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    public navParams: NavParams
  ) {
    this.fetchUserData();
    this.tabsParams = this.navParams;
  }

  fetchUserData(){
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.userProvider.getUserData().subscribe((settings) => {
          if(settings){
            this.userLoaded = true;
          }
        });
      }
    });
  }


  ionViewDidEnter() {

    //to redirect
    /*let _self = this;
    setTimeout(function(){
      _self.tabRef.select(1);
    }, 0);
    */

  }


}
