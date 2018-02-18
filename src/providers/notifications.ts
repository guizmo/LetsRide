import { Injectable } from '@angular/core';
import { App, AlertController } from 'ionic-angular';

import {OneSignal} from '@ionic-native/onesignal';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { NOTIFICATIONS } from '../data/notifications';
import { ONE_SIGNAL_GOOGLE_ID, ONE_SIGNAL_ID, ONE_SIGNAL_TPL } from '../app/configs';

@Injectable()
export class NotificationsProvider {
  one_id: string = null;
  private appId = ONE_SIGNAL_ID;
  private googleProjectId = ONE_SIGNAL_GOOGLE_ID;
  public templates = ONE_SIGNAL_TPL;

  private navCtrl;
  private navParams;

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
  }
//http://codegists.com/snippet/typescript/one-signal-pushts_movibe_typescript
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

  getIds(){
    this.oneSignal.getIds().then(result => {
      console.log('result', result);
    });
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


  sendFriendRequest(dataFrom, dataTo){

    let contents = {
      'en': `${dataFrom.displayName} sent you a friend request!`,
      'fr': `${dataFrom.displayName} vous a envoyé une demande d'ami!`
    }
    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: dataFrom.oneSignalId || null,
        user_id: dataFrom.aFuid,
        pending: true,
      },
      displayName: dataTo.settings.displayName
    };
    this.afdb.list(`/users/${dataTo.aFuid}/buddies`).update(dataFrom.aFuid, data.from);

    if(dataFrom.oneSignalId && dataTo.oneSignalId){
      this.sendMessage([oneSignalId], data, contents);
    }

  }


}
