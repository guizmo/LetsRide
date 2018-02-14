import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Tabs, NavParams } from 'ionic-angular';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

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
  private ngUnsubscribe:Subject<void> = new Subject();

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

  ionViewDidLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fetchUserData(){
    this.afAuth.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      if(user){
        this.userProvider.getUserData().takeUntil(this.ngUnsubscribe).subscribe((settings) => {
          if(settings){
            this.userLoaded = true;
          }
        });
      }
    });
  }



  ionViewDidEnter() {
    //console.log('TABS ionViewDidEnter');
    //to redirect
    /*let _self = this;
    setTimeout(function(){
      _self.tabRef.select(1);
    }, 0);
    */

  }


}
