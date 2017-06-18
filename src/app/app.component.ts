import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Config } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateService } from '@ngx-translate/core'

import { MainPage, ListPage, LoginPage} from '../pages';

import { User } from '../providers/user';

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

  constructor(private translate: TranslateService, private config: Config, public user: User, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initTranslate();
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }


  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');

    if (this.translate.getBrowserLang() !== undefined) {
      this.translate.use(this.translate.getBrowserLang());
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
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
