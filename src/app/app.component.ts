import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, MenuController, Events} from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Dialogs } from '@ionic-native/dialogs';
import { AppVersion } from '@ionic-native/app-version';

import { Translate, NotificationsProvider, LocationTrackerProvider, HotUpdateProvider } from '../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/map';


@Component({
  templateUrl: 'app.html',
})
export class LetsRide {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'MainPage';
  is_active = 'MainPage';
  badges = null;
  pages: any[] = [
    { title: 'Home', component: 'MainPage', icon: 'home', is_active: true },
    { title: 'Profile', component: 'ProfilePage', icon: 'person', is_active: false },
    { title: 'Places', component: 'PlacesPage', icon: 'map', is_active: false },
    { title: 'Friends', component: 'BuddiesTabsPage', icon: 'people', is_active: false },
    { title: 'Events', component: 'EventsPage', icon: 'calendar', is_active: false },
    { title: 'Notifications', component: 'NotificationsPage', icon: 'mail', is_active: false },
  ]

  currentUser: any = null;
  appliVersion = null;
  appliName = null;
  fetchByIdSubscription;

  constructor(
    private translate: Translate,
    private dialogs: Dialogs,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private afAuth: AngularFireAuth,
    public menuCtrl: MenuController,
    private locationTracker: LocationTrackerProvider,
    private notifications: NotificationsProvider,
    private appVersion: AppVersion,
    private hotUpdate: HotUpdateProvider,
    public events: Events,
  ) {
    this.translate.init();
    this.handleEvents();
    afAuth.authState.subscribe((user) => {
      if (!user) {
        this.nav.setRoot('LoginPage');
      } else {
        this.menuCtrl.enable(true, 'mainMenu');
        this.currentUser = {...user.providerData[0], ...{'aFuid': user.uid} };
        this.getBadges(user.uid);
      }


    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.menuCtrl.enable(false, 'mainMenu');

      if(this.platform.is('cordova')){
        if(this.hotUpdate.loader){
          this.hotUpdate.loader.dismiss();
        }
        this.hotUpdate.init();
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.notifications.init(this.nav);
        this.locationTracker.initLocation();
        this.appVersion.getVersionNumber().then(res => this.appliVersion = res);
        this.appVersion.getAppName().then(res => this.appliName = res);
      }
    });
  }

  getBadges(uid:string){
    console.log('getBadges');
    this.fetchByIdSubscription = this.notifications.fetchById(uid).subscribe(res => {
      if(res){
        let toRead = res.map((changes) => ({ key: changes.key, ...changes.payload.val() }) ).filter(res => {
          return res.read === false;
        })
        let eventsTmp = {};
        let uniq = toRead.reverse().filter( notif => {
          let event_id = notif.data.event.id;
          if(!eventsTmp[event_id]){
            eventsTmp[event_id] = notif;
            return true;
          }
        });

        this.badges = uniq;
        this.pages[5].counter = this.badges.length;
      }
    });
  }

  handleEvents() {
    this.events.subscribe('user:logout', () => {
      this.fetchByIdSubscription.unsubscribe();
    });
  }


  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    /*if(page == 'NotifsPage'){
      let data = {displayName: "Guillaume Bartolini", eventId: "-Kt5-pe0rAEMKbwuaM6b", type: "newEvent", from: {user_id: "VMNmYlatT7aZzWfGBwM9aJzf6WN2", oneSignalId: "337092a2-4fa9-46df-9116-94fa3d701148"}};
      this.nav.setRoot('EventsPage', data);
    }else{
      this.nav.setRoot(page);
    }*/
    this.nav.setRoot(page);
    this.is_active = page;
  }

}
