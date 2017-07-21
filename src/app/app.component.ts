import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Dialogs } from '@ionic-native/dialogs';

import { ListPage} from '../pages';
import { Translate, NotificationsProvider } from '../providers';

import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  templateUrl: 'app.html',
  //providers: [NotificationsProvider]
})
export class LetsRide {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'MainPage';
  pages: any[] = [
    { title: 'Home', component: 'MainPage' },
    { title: 'Profile', component: 'ProfilePage' },
    { title: 'Places', component: 'PlacesPage' },
    { title: 'Buddies', component: 'BuddiesTabsPage' },
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
    private afAuth: AngularFireAuth,
    private notifications: NotificationsProvider
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
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      if(this.platform.is('cordova')){
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.notifications.init(this.nav);
      }
    })
  }


  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario

    this.nav.setRoot(page);
  }
}
