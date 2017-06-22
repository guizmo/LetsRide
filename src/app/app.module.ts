import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Storage, IonicStorageModule } from '@ionic/storage';

import { LetsRide } from './app.component';
import { MainPage, ListPage} from '../pages';

import { Api, Settings, UserProvider, Translate, AppEvents, DisciplinesService } from '../providers';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Facebook } from '@ionic-native/facebook';
import { Dialogs } from '@ionic-native/dialogs';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AuthService } from '../providers/auth-service';

import { GbLogoutButton } from '../components/gb-logout-button/gb-logout-button';

export const firebaseConfig = {
  apiKey: "AIzaSyBvmBNw3scf3o1dSZGQRGjFUGfhlOQw0a0",
  authDomain: "lets-ride-a073c.firebaseapp.com",
  databaseURL: "https://lets-ride-a073c.firebaseio.com",
  projectId: "lets-ride-a073c",
  storageBucket: "lets-ride-a073c.appspot.com",
  messagingSenderId: "897213692051"
};

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}

@NgModule({
  declarations: [
    LetsRide,
    MainPage,
    ListPage,
    GbLogoutButton
  ],
  imports: [
    BrowserModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    IonicModule.forRoot(LetsRide),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    LetsRide,
    MainPage,
    ListPage
],
  providers: [
    Api,
    UserProvider,
    DisciplinesService,
    Translate,
    StatusBar,
    SplashScreen,
    AuthService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Facebook,
    Dialogs,
    SpinnerDialog,
    AppEvents
  ]
})
export class AppModule {}
