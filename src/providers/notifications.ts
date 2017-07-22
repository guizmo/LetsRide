import { Injectable } from '@angular/core';
import { IonicPage, App } from 'ionic-angular';

import {OneSignal} from '@ionic-native/onesignal';

/*
  Generated class for the NotificationsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class NotificationsProvider {
  one_id: string = null;

  private navCtrl;
  private navParams;
  public templates = {
    friendRequest: 'e4732e1a-6463-4291-b4ab-c6fcb05ef22d',
    friendRequestAccepted: '549bdde4-45ea-4197-8161-4255483695f0',
    closeBy: 'a54afeb9-5ef1-4c7b-a226-cddb8a8e83df'
  }


  constructor(
    private oneSignal: OneSignal,
    private app: App,
  ) {
    console.log(this);
    //this.navCtrl = this.app.getRootNav();
  }

  init(nav) {
    this.navCtrl = nav;
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
        this.handleNotificationOpened(data.notification.payload.additionalData);
      }
    });


    this.oneSignal.getIds().then((ids) => {
      console.log('oneSignal.getIds', ids);
      this.one_id = ids.userId;
    });


    this.oneSignal.endInit();

  }



  sendMessage(userIds: string[], payload, contents:any = null){

    //let template = (payload.friendRequest) ? this.templates.friendRequest : (payload.friendRequestAccepted) ? this.templates.friendRequestAccepted : '' ;

    let template = this.templates[payload.type];



    console.log('template = ', template);


    let notificationObj:any = {
      include_player_ids: userIds,
      data: payload,
      template_id: template
    };

    if(contents){
      notificationObj.contents = contents;
    }

    console.log(notificationObj);


    return this.oneSignal.postNotification(notificationObj);
  }




  tagUser(tags:any){
    this.oneSignal.sendTags(tags);
  }

  handleNotificationOpened(data){
    if(!this.navCtrl){
      console.log(' init(this.nav) did not work');
      this.navCtrl = this.app.getRootNav();
      this.navParams = this.navCtrl.getActive().getNavParams();
    }

    let MsgType = data.type;

    if(MsgType){
      this.navCtrl.setRoot('NotificationsPage', data);
    }
  }

}
