import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, Events, App} from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppVersion } from '@ionic-native/app-version';

import { Translate, UserProvider, NotificationsProvider, LocationTrackerProvider, HotUpdateProvider } from '../providers';

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
    { title: 'Messages', component: 'MessagesPage', icon: 'chatbubbles', is_active: false }
    //{ title: 'MockNotifsPage', component: 'MockNotifsPage', icon: 'mail', is_active: false },
  ]

  currentUser: any = null;
  appliVersion = null;
  appliName = null;
  fetchByIdSubscription;
  translated:any = {};



  constructor(
    private translate: Translate,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private afAuth: AngularFireAuth,
    public menuCtrl: MenuController,
    private userProvider: UserProvider,
    private locationTracker: LocationTrackerProvider,
    private notifications: NotificationsProvider,
    private appVersion: AppVersion,
    private hotUpdate: HotUpdateProvider,
    private app: App,
    public events: Events,
  ) {
    console.log('app component');
    console.log(this);

    this.handleEvents();
    this.translate.getString(['MENU', 'LOGIN_TITLE']).subscribe( values => {
      this.translated.login = values.LOGIN_TITLE;
      this.translated.accountPage = values.MENU.AccountPage;
      this.pages.map(page => page.title = values.MENU[page.component])
    });
    this.userProvider.getUser().subscribe(user => {
      console.log('app getUser()');
      if (!user) {
        this.currentUser = null;
        this.nav.setRoot('LoginPage');
      } else {
        this.menuCtrl.enable(true, 'mainMenu');
        this.currentUser = user;
        this.userProvider.checkOneSignalID();
        this.getBadges(user.aFuid);
      }
    })
    /*this.afAuth.authState.subscribe((user) => {
      if (!user) {
        this.nav.setRoot('LoginPage');
      } else {
        this.menuCtrl.enable(true, 'mainMenu');
        this.currentUser = {...user.providerData[0], ...{'aFuid': user.uid} };
        this.getBadges(user.uid);
      }
    });*/
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
    this.fetchByIdSubscription = this.notifications.fetchById(uid).subscribe(res => {
      if(res){
        let toRead = res.map((changes) => ({ key: changes.key, ...changes.payload.val() }) ).filter(res => {
          return res.read === false;
        })
        toRead = toRead.filter(res => res.data.type === 'newEvent' || res.data.type === 'friendRequest');
        this.pages.map(page => {
          if(page.component == 'NotificationsPage'){
            page.counter = toRead.length;
          }
        })
      }
    });
  }

  handleEvents() {
    this.events.subscribe('user:logout', () => {
      this.locationTracker.stopTracking();
      this.fetchByIdSubscription.unsubscribe();
    });

    this.app.viewWillEnter.subscribe((view) => {
      if (view.instance && view.instance.activeMenu) {
        let name = view.instance.activeMenu;

        if(view.getNav() && view.getNav().canGoBack()){
          return false;
        }
        this.is_active = name;
      }
    });
  }


  openPage(page) {
    this.nav.setRoot(page);
    this.is_active = page;
  }

}
