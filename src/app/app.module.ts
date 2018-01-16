import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
import { Diagnostic } from '@ionic-native/diagnostic';
import { AppVersion } from '@ionic-native/app-version';
import { CodePush } from '@ionic-native/code-push';

import { MomentModule } from 'angular2-moment';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { NgPipesModule, LatinisePipe } from 'ngx-pipes';

//import 'web-animations-js/web-animations.min';
//import { AgmCoreModule } from '@agm/core';
//import {GoogleMapsAPIWrapper} from '@agm/core/services';
import {
  AgmCoreModule,
  MapsAPILoader,
  NoOpMapsAPILoader,
  MouseEvent,
  GoogleMapsAPIWrapper,
} from '@agm/core';

import { ReactiveFormsModule } from '@angular/forms';

import { LetsRide } from './app.component';

import {
  UserProvider,
  Translate,
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
  FacebookProvider,
  PeopleProvider,
  PermissionsProvider,
  CloudFunctionsProvider,
  StringManipulationProvider,
  HotUpdateProvider
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
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, 'assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    LetsRide,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GbLogoutButtonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
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
    MomentModule,
    NgPipesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    LetsRide,
  ],
  providers: [
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
    PeopleProvider,
    Diagnostic,
    CodePush,
    AppVersion,
    PermissionsProvider,
    VirtualScrollModule,
    CloudFunctionsProvider,
    LatinisePipe,
    StringManipulationProvider,
    HotUpdateProvider
  ]
})
export class AppModule {}
