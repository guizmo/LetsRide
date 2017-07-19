import { Injectable } from '@angular/core';
import { IonicPage, NavController, App } from 'ionic-angular';

import {OneSignal} from '@ionic-native/onesignal';

/*
  Generated class for the NotificationsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class NotificationsProvider {
  one_id: string = null;

  private navCtrl: NavController;


  constructor(
    private oneSignal: OneSignal,
    private app: App,
  ) {
    this.navCtrl = app.getActiveNav();
    console.log(this);
  }

  init() {
    let appid = '1b28e204-835f-4462-9c10-5b8eb31bfcc9';
    //let googleProjectId = '';
    //this.oneSignal.startInit(appId, googleProjectId);
    this.oneSignal.startInit(appid);
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    this.oneSignal.setSubscription(true);
    this.oneSignal.handleNotificationReceived().subscribe((data) => {
      // handle received here how you wish.
      console.log(data);
    });
    this.oneSignal.handleNotificationOpened().subscribe((data) => {
      // handle opened here how you wish.
      console.log(data);

      if(data.notification.payload.additionalData){
        this.handleData(data.notification.payload.additionalData);
      }
    });


    this.oneSignal.getIds().then((ids) => {
      console.log(ids);
      this.one_id = ids.userId;
    });


    this.oneSignal.endInit();

  }

  sendMessage(userId:string, payload){
    let notificationObj:any = {
      contents: {
        en: "message body my message",
      },
      include_player_ids: [userId],
      data: payload,
      url: 'www.google.com'
    };
    this.oneSignal.postNotification(notificationObj).then((success) => {
      console.log(success);
    }).catch((error) => {
      console.log(error);
    })
  }

  tagUser(tags:any){
    this.oneSignal.sendTags(tags);
  }

  handleData(data){
    if(!this.navCtrl){
      this.navCtrl = this.app.getActiveNav();
    }
    if(data.friendRequest){
      this.navCtrl.setRoot('NotificationsPage', data);
    }
  }

}
