import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { Network } from '@ionic-native/network';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';
import { OneSignal } from '@ionic-native/onesignal';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

import { MomentModule } from 'angular2-moment';

import 'web-animations-js/web-animations.min';

// import { AgmCoreModule } from '@agm/core';
// import {GoogleMapsAPIWrapper} from '@agm/core/services';
import {
  AgmCoreModule,
  MapsAPILoader,
  NoOpMapsAPILoader,
  MouseEvent,
  GoogleMapsAPIWrapper,
} from '@agm/core';

import { ReactiveFormsModule } from '@angular/forms';

import { LetsRide } from './app.component';
import { ListPage} from '../pages';

import {
  Api,
  Settings,
  UserProvider,
  Translate,
  AppEvents,
  DisciplinesProvider,
  CountriesProvider,
  LoadingProvider,
  AlertProvider,
  PlacesProvider,
  ConnectivityService,
  LocationTrackerProvider,
  NotificationsProvider,
  BuddiesProvider,
  FileProvider,
  CaptureProvider,
  FacebookProvider
} from '../providers';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { Dialogs } from '@ionic-native/dialogs';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { GbLogoutButtonModule } from '../components/gb-logout-button/gb-logout-button.module';

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
    ListPage,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    GbLogoutButtonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBvmBNw3scf3o1dSZGQRGjFUGfhlOQw0a0',
      libraries: ['places']
    }),
    IonicModule.forRoot(LetsRide),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    LetsRide,
    ListPage,
  ],
  providers: [
    Api,
    UserProvider,
    DisciplinesProvider,
    Translate,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Facebook,
    GooglePlus,
    Dialogs,
    SpinnerDialog,
    AppEvents,
    CountriesProvider,
    LoadingProvider,
    AlertProvider,
    PlacesProvider,
    NativePageTransitions,
    GoogleMapsAPIWrapper,
    ConnectivityService,
    Network,
    LocationTrackerProvider,
    BackgroundGeolocation,
    Geolocation,
    OneSignal,
    NotificationsProvider,
    BuddiesProvider,
    FileProvider,
    File,
    Camera,
    FilePath,
    CaptureProvider,
    FacebookProvider,
  ]
})
export class AppModule {}
