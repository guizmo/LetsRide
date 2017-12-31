import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, MenuController} from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Dialogs } from '@ionic-native/dialogs';

import { ListPage} from '../pages';
import { Translate, NotificationsProvider, LocationTrackerProvider } from '../providers';

import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  templateUrl: 'app.html',
})
export class LetsRide {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'MainPage';
  is_active = 'MainPage';
  pages: any[] = [
    { title: 'Home', component: 'MainPage', icon: 'home', is_active: true },
    { title: 'Profile', component: 'ProfilePage', icon: 'person', is_active: false },
    { title: 'Places', component: 'PlacesPage', icon: 'map', is_active: false },
    { title: 'Friends', component: 'BuddiesTabsPage', icon: 'people', is_active: false },
    { title: 'Events', component: 'EventsPage', icon: 'calendar', is_active: false },
    //{ title: 'Notifs', component: 'NotifsPage', icon: 'calendar', is_active: false },
  ]

  currentUser: any = null;

  constructor(
    private translate: Translate,
    private dialogs: Dialogs,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private afAuth: AngularFireAuth,
    public menuCtrl: MenuController,
    private locationTracker: LocationTrackerProvider,
    private notifications: NotificationsProvider
  ) {
    this.translate.init();

    afAuth.authState.subscribe((user) => {
      if (!user) {
        this.nav.setRoot('LoginPage');
      } else {
        this.menuCtrl.enable(true, 'mainMenu');
        this.currentUser = {...user.providerData[0], ...{'aFuid': user.uid} };
      }

    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.menuCtrl.enable(false, 'mainMenu');

      if(this.platform.is('cordova')){
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.notifications.init(this.nav);
        this.locationTracker.initLocation();
      }
    });
  }



  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if(page == 'NotifsPage'){
      let data = {displayName: "Guillaume Bartolini", eventId: "-Kt5-pe0rAEMKbwuaM6b", type: "newEvent", from: {user_id: "VMNmYlatT7aZzWfGBwM9aJzf6WN2", oneSignalId: "337092a2-4fa9-46df-9116-94fa3d701148"}};
      this.nav.setRoot('EventsPage', data);
    }else{
      this.nav.setRoot(page);
    }
    this.is_active = page;
  }
}
