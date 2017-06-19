import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { MainPage, ListPage, LoginPage} from '../pages';

import { User, Translate } from '../providers';

@Component({
  templateUrl: 'app.html'
})
export class LetsRide {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = MainPage;
  loginPage: any = { title: 'Login', component: LoginPage };
  pages: any[] = [
    { title: 'Home', component: MainPage },
    { title: 'Profile', component: ListPage },
    { title: 'Places', component: ListPage },
    { title: 'settings', component: ListPage }
  ]

  constructor(private translate: Translate, public user: User, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.translate.init();
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }


  logout(){
    this.user.logout();
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
