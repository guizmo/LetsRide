import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Dialogs } from '@ionic-native/dialogs';

import { ListPage} from '../pages';
import { Translate} from '../providers';

import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  templateUrl: 'app.html'
})
export class LetsRide {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'MainPage';
  pages: any[] = [
    { title: 'Home', component: 'MainPage' },
    { title: 'Profile', component: 'ProfilePage' },
    { title: 'Places', component: 'PlacesPage' },
    { title: 'List', component: ListPage },
    { title: 'settings', component: ListPage }
  ]

  currentUser: any = null;

  constructor(
    private translate: Translate,
    private dialogs: Dialogs,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private afAuth: AngularFireAuth
  ) {
    this.translate.init();
    console.log('app.component constructor',  this)

    afAuth.authState.subscribe((user) => {
      if (!user) {
        this.nav.setRoot('LoginPage');
      } else {
        this.currentUser = {...user.providerData[0], ...{'aFuid': user.uid} };
      }

    });

  }

  ionViewDidLoad() {
    //NEVER CALLED
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });


  }



  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario

    this.nav.setRoot(page);
  }
}
