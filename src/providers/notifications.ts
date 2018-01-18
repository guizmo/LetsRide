import { Injectable } from '@angular/core';
import { App, AlertController } from 'ionic-angular';

import {OneSignal} from '@ionic-native/onesignal';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { NOTIFICATIONS } from '../data/notifications';

@Injectable()
export class NotificationsProvider {
  one_id: string = null;
  private appId = '1b28e204-835f-4462-9c10-5b8eb31bfcc9';
  private googleProjectId = '897213692051';

  private navCtrl;
  private navParams;
  public templates = {
    friendRequest: 'e4732e1a-6463-4291-b4ab-c6fcb05ef22d',
    friendRequestAccepted: '549bdde4-45ea-4197-8161-4255483695f0',
    closeBy: 'a54afeb9-5ef1-4c7b-a226-cddb8a8e83df',
    newEvent: '01bda817-8355-4ff7-86e0-6e340a4bb75e',
    eventUpdate: '5416d6a8-9f7a-491a-8bf5-1114b194e5eb',
    joinedEvent: '9558f575-afc3-4d51-9eb8-fb7a937a2425'
  }

  public fetchAllRef:AngularFireList<any>;
  public fetchAll:Observable<any>;
  public fetch_by_idRef:AngularFireList<any>;
  public fetch_by_id:Observable<any>;

  constructor(
    private oneSignal: OneSignal,
    private afdb: AngularFireDatabase,
    private app: App,
    private alertCtrl: AlertController
  ) {
    //console.log('OneSignal', this);
    //this.navCtrl = this.app.getRootNav();
    this.fetchAllRef = this.afdb.list(`/notifications`);
    this.fetchAll = this.fetchAllRef.snapshotChanges();
    console.log(NOTIFICATIONS);
  }

  init(nav) {
    this.navCtrl = nav;
    this.oneSignal.startInit(this.appId, this.googleProjectId);
    //this.oneSignal.startInit(appid);
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    this.oneSignal.setSubscription(true);
    this.oneSignal.handleNotificationReceived().subscribe((data) => {
      // handle received here how you wish.
    });
    this.oneSignal.handleNotificationOpened().subscribe((data) => {
      // handle opened here how you wish.
      if(data.notification.payload.additionalData){
        this.handleNotificationOpened(data.notification.payload);
      }
    });


    this.oneSignal.getIds().then((ids) => {
      this.one_id = ids.userId;
    });


    this.oneSignal.endInit();

  }



  sendMessage(onesignalIds: string[], payload, contents:any = null, headings:any = null){
    //let template = (payload.friendRequest) ? this.templates.friendRequest : (payload.friendRequestAccepted) ? this.templates.friendRequestAccepted : '' ;
    let template = this.templates[payload.type];

    let notificationObj:any = {
      include_player_ids: onesignalIds,
      data: payload,
      template_id: template
    };

    if(contents){
      notificationObj.contents = contents;
    }
    if(headings){
      notificationObj.headings = headings;
    }

    //console.log('notificationObj ', JSON.stringify(notificationObj));

    this.oneSignal.postNotification(notificationObj).then(res => {
      //console.log('postNotification ', JSON.stringify(res));
      if(res.errors && res.errors.invalid_player_ids){
        let include_player_ids = notificationObj.include_player_ids.filter(val => !res.errors.invalid_player_ids.includes(val))
        notificationObj.include_player_ids = include_player_ids;
      }
      this.saveNotification(res.id, notificationObj);
    })
  }


  saveNotification(id:string, notificationObj:any){
    console.log('saveNotification', id);
    console.log(notificationObj);

    let uids = [];
    if(notificationObj.data.to){
      if(notificationObj.data.to.user_ids){
        uids = notificationObj.data.to.user_ids;
      }else if(notificationObj.data.to.user_id){
        uids.push(notificationObj.data.to.user_id);
      }
    }else{
      return;
    }

    for (let i = 0; i < uids.length; i++) {
        //let onesignal_uid = uids[i];
        let uid = uids[i];
        let obj = {};
        notificationObj.read = false;
        obj[id] = notificationObj
        this.fetchAllRef.update(uid, obj);
    }
  }

  tagUser(tags:any){
    this.oneSignal.sendTags(tags);
  }

  handleNotificationOpened(payload){
    if(!this.navCtrl){
      this.navCtrl = this.app.getRootNavs()[0];
      this.navParams = this.navCtrl.getActive().getNavParams();
    }
    //console.log('nav', this.navCtrl);
    //console.log('Active page', this.navCtrl.getActive().name);
    //console.log('getActive', this.navCtrl.getActive());

    let page = 'NotificationsPage';
    let params:any = {};

    if(payload.additionalData.type){
      switch(payload.additionalData.type) {
        case 'friendRequest':
          page = 'NotificationsPage'
          params = {
            tabIndex: 1,
          };
          break;
        case 'friendRequestAccepted':
          page = 'BuddiesTabsPage'
          break;
        case 'closeBy':
          page = 'MainPage'
          break;
        case 'joinedEvent':
          page = 'EventsPage'
          break;
        case 'eventUpdate':
          page = 'EventsPage'
          break;
        case 'newEvent':
          page = 'NotificationsPage'
          break;
        default:
          page = 'NotificationsPage'
      }

      params = {
        additionalData: payload.additionalData,
        type: payload.additionalData.type,
        notificationID: payload.notificationID,
        message: {
          title: payload.title,
          body: payload.body
        },
        page: page
      }
      this.presentAlert(params);
      //console.log(params);
      //this.navCtrl.setRoot(page, params);
    }
  }

  fetchById(uid:string){
    this.fetch_by_idRef = this.afdb.list(`/notifications/${uid}`, ref => ref.orderByChild('data/event/timestamp'));
    this.fetch_by_id = this.fetch_by_idRef.snapshotChanges();
    return this.fetch_by_id;
  }

  deleteNotif(uid:string, key:string){
    return this.afdb.object(`/notifications/${uid}/${key}`).remove();
  }

  setNotifState(key, state){
    this.fetch_by_idRef.update(key, { read: state });
  }


  mockNotifs(type:string){
    this.handleNotificationOpened(NOTIFICATIONS[type]);
  }

  presentAlert(data) {
    let alert = this.alertCtrl.create({
      title: data.message.title,
      subTitle: data.message.body,
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log(data);
          this.navCtrl.setRoot(data.page, data);
        }
      }]
    });
    alert.present();
  }

}
