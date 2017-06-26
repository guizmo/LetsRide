import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Dialogs } from '@ionic-native/dialogs';

import { MainPage, ListPage, LoginPage} from '../pages';
import { Translate, AppEvents, UserProvider} from '../providers';

@Component({
  templateUrl: 'app.html'
})
export class LetsRide {
  @ViewChild(Nav) nav: Nav;

  rootPage:any = MainPage;
  public zone:NgZone;

  loginPage: any = { title: 'Login', component: LoginPage };
  pages: any[] = [
    { title: 'Home', component: MainPage },
    { title: 'Profile', component: 'ProfilePage' },
    { title: 'Places', component: 'PlacesPage' },
    { title: 'List', component: ListPage },
    { title: 'settings', component: ListPage }
  ]

  currentUser;

  constructor(
    private translate: Translate,
    private dialogs: Dialogs,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public appEvents: AppEvents,
    public userProvider: UserProvider
  ) {
    this.zone = new NgZone({});
    this.translate.init();
    console.log('app.compenent constructor',  this)
    this.userProvider.currentProfile.subscribe(data => {
      this.currentUser = data;
      this.zone.run( () => {
        if (!data) {
          this.rootPage = 'LoginPage';
          /*if (this.nav){
            this.nav.setRoot('LoginPage')
          }*/
        } else {
          //this.rootPage = MainPage;
        }
      });
    });
  }

  ionViewDidLoad() {
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

    switch (page) {
      case 'ProfilePage':
        page = this.currentUser != null ? page : 'LoginPage';
        break;
      default:
        page = page;
        break;
    }
    console.log(this)

    this.nav.setRoot(page);
  }
}
