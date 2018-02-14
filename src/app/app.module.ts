import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

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
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';


import { LetsRide } from './app.component';

import {
  UserProvider,
  Translate,
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
  HotUpdateProvider,
  UtilsProvider,
  GoogleMapsConfig,
  SearchProvider,
  MessagesProvider
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

import { ComponentsModule } from '../components/components.module';

import { firebaseConfig, GOOGLEMAPAPIKEY } from './configs';

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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ComponentsModule,
    IonicModule.forRoot(LetsRide),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    MomentModule,
    NgPipesModule,
    AgmCoreModule.forRoot({
      apiKey: GOOGLEMAPAPIKEY,
      libraries: ['places'],
      language: 'en'
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    LetsRide,
  ],
  providers: [
    UserProvider,
    Translate,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsConfig, deps: [Translate]},
    Facebook,
    GooglePlus,
    Dialogs,
    SpinnerDialog,
    LoadingProvider,
    AlertProvider,
    PlacesProvider,
    NativePageTransitions,
    ConnectivityService,
    Network,
    BuddiesProvider,
    LocationTrackerProvider,
    BackgroundGeolocation,
    Geolocation,
    OneSignal,
    NotificationsProvider,
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
    HotUpdateProvider,
    UtilsProvider,
    SearchProvider,
    MessagesProvider,
  ]
})
export class AppModule {}
