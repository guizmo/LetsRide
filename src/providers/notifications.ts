import { Injectable } from '@angular/core';
import { IonicPage, App } from 'ionic-angular';

import {OneSignal} from '@ionic-native/onesignal';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';


@Injectable()
export class NotificationsProvider {
  one_id: string = null;

  private navCtrl;
  private navParams;
  public templates = {
    friendRequest: 'e4732e1a-6463-4291-b4ab-c6fcb05ef22d',
    friendRequestAccepted: '549bdde4-45ea-4197-8161-4255483695f0',
    closeBy: 'a54afeb9-5ef1-4c7b-a226-cddb8a8e83df',
    newEvent: '01bda817-8355-4ff7-86e0-6e340a4bb75e',
    joinedEvent: '9558f575-afc3-4d51-9eb8-fb7a937a2425'
  }

  public fetchAll:FirebaseListObservable<any[]>;
  public fetch_by_id:FirebaseListObservable<any[]>;

  constructor(
    private oneSignal: OneSignal,
    private afdb: AngularFireDatabase,
    private app: App,
  ) {
    console.log('OneSignal', this);
    //this.navCtrl = this.app.getRootNav();
    this.fetchAll = this.afdb.list(`/notifications`);
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
        this.handleNotificationOpened(data.notification.payload);
      }
    });


    this.oneSignal.getIds().then((ids) => {
      console.log('oneSignal.getIds', ids);
      this.one_id = ids.userId;
    });


    this.oneSignal.endInit();

  }



  sendMessage(userIds: string[], payload, contents:any = null, headings:any = null){
    //let template = (payload.friendRequest) ? this.templates.friendRequest : (payload.friendRequestAccepted) ? this.templates.friendRequestAccepted : '' ;

    let template = this.templates[payload.type];

    let notificationObj:any = {
      include_player_ids: userIds,
      data: payload,
      template_id: template
    };

    if(contents){
      notificationObj.contents = contents;
    }
    if(headings){
      notificationObj.headings = headings;
    }

    console.log('notificationObj ', JSON.stringify(notificationObj));

    this.oneSignal.postNotification(notificationObj).then(res => {
      console.log('postNotification ', JSON.stringify(res));
      if(!res.errors){
        this.saveNotification(res.id, notificationObj);
      }
    })
  }


  saveNotification(id:string, notificationObj:any){
    let uids = notificationObj.include_player_ids;
    for (let i = 0; i < uids.length; i++) {
        //let onesignal_uid = uids[i];
        let uid = notificationObj.data.to.user_id;
        let obj = {};
        notificationObj.read = false;
        obj[id] = notificationObj
        this.fetchAll.update(uid, obj);
    }
  }

  tagUser(tags:any){
    this.oneSignal.sendTags(tags);
  }

  handleNotificationOpened(payload){
    if(!this.navCtrl){
      console.log('init(this.nav) did not work');
      this.navCtrl = this.app.getRootNav();
      this.navParams = this.navCtrl.getActive().getNavParams();
    }
    let data = payload.additionalData;

    console.log(data);
    console.log(JSON.stringify(data));

    if(data.type && data.type == 'newEvent'){
      this.navCtrl.setRoot('EventsPage', data);
    }
  }

  fetchById(uid:string){
    this.fetch_by_id = this.afdb.list(`/notifications/${uid}`, ref => ref.orderByChild('read'));
    return this.fetch_by_id;
  }
}
