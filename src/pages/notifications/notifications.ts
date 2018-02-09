import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';
import * as moment  from 'moment';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, NotificationsProvider, BuddiesProvider, PlacesProvider, UtilsProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  activeMenu = 'NotificationsPage';
  notifEventId = null;
  public disciplines:ReadonlyArray<any>;
  public eventsNotifications: any = [] ;
  public requestsNotifications: any = [] ;
  private showMapIsEnabled: string = null;
  private mapModal;
  public badges = {
    requests: 0,
    events: 0
  }
  public userData;
  public currentUser;
  public messagesFrom;
  public buddies: any = [] ;
  public buddiesRequest: any = [] ;
  public buddiesEvents: any = [];
  public requestAccepted: any = [];
  private buddiesEventsSubscription;
  private buddiesRequestSubscription;
  private badgesNotifSubscription;
  private refreshBuddiesEventsSubscription: any = [];
  private buddiesSubcription;

  public messages: string = "events";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private placesProvider: PlacesProvider,
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private modalCtrl: ModalController,
    private buddiesProvider: BuddiesProvider,
    private notifications: NotificationsProvider,
    public utils: UtilsProvider
  ) {
    console.log(this);
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;
    if(this.navParams.get('notificationID')){
      let eventType = this.navParams.get('type');
      if(eventType == 'friendRequest'){
        this.messages = 'requests';
      }else{
        this.notifEventId = this.navParams.get('additionalData').event.id;
      }
    }

    this.afAuth.authState.subscribe((user) => {
      if(user){
        let userData = (this.userProvider.userData) ? this.userProvider.userData : this.userProvider.getUserData() ;
        userData.subscribe((settings) => {
          if(settings){
            this.userData = settings;
            this.currentUser = user.toJSON();
            this.init();
          }
        });
      }
    });
  }

  ionViewDidEnter() {
    console.log(this);
  }

  ionViewWillUnload(){
    this.buddiesSubcription.unsubscribe();
    this.badgesNotifSubscription.unsubscribe();
    this.buddiesRequestSubscription.unsubscribe();
    for(let uid in this.refreshBuddiesEventsSubscription){
      if(this.refreshBuddiesEventsSubscription[uid]){
        this.refreshBuddiesEventsSubscription[uid].unsubscribe();
      }
    }
  }

  init(){
    this.getBuddies(this.currentUser.uid);
    this.getBuddiesRequest(this.currentUser.uid);
    this.getBadges(this.currentUser.uid);
  }

  getBuddies(uid:string){
    this.buddiesProvider.getBuddies(this.currentUser.uid);
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((buddies) => {
      if(buddies.length){
        this.buddies = buddies;
        this.listenToBuddiesEvents(buddies);
      }
    });
  }

  listenToBuddiesEvents(buddies){
    for(let buddy of buddies){
      if(!this.refreshBuddiesEventsSubscription[buddy.aFuid]){
        let subscription = this.buddiesProvider.refreshBuddiesEvents(buddy.aFuid).subscribe((events) => {
          if(events){
            this.buildEventList(buddy, events);
          }
        });
        this.refreshBuddiesEventsSubscription[buddy.aFuid] = subscription;
      }
    }
  }

  buildEventList(bud, bud_events){
    let now = moment();
    let buddyEvent = {
      displayName: bud.settings.displayName,
      oneSignalId: bud.oneSignalId || null,
      aFuid: bud.aFuid
    };

    for (let key in bud_events) {
      let event = bud_events[key];
      event.isNewNotif = false;
      if(this.notifEventId && key == this.notifEventId){
        event.isNewNotif = true;
      }
      event.key = key;
      event.participates = null;
      let eventTime = moment(event.time);

      if(event.disciplines){
        let discipline = this.utils.getRidingStyle(event.disciplines, this.disciplines);
        event.disciplines = discipline.name;
      }


      if (eventTime.diff(now) >= 0){
        if(event.participants && typeof(event.participants[this.currentUser.uid]) != 'undefined'){
          event.participates = event.participants[this.currentUser.uid];
        }

        let obj = Object.assign(event, buddyEvent);
        let index = this.buddiesEvents.findIndex(x => x.key === event.key);

        if(index < 0 && event.participates === null){
          this.buddiesEvents.push(obj);
        }else{
          if(event.participates === null){
            this.buddiesEvents[index] = obj;
          }
        }
      }
    }
    this.buddiesEvents.sort(function(a,b) {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    }).sort(function(a,b) {
      return (a.isNewNotif === b.isNewNotif)? 0 : a.isNewNotif? -1 : 1;
    });
  }


  getBuddiesRequest(uid:string){
    this.buddiesRequestSubscription = this.buddiesProvider.buddiesRequest.subscribe((friendRequests) => {
      friendRequests.map((_buddy) => {
        _buddy.sortByName = _buddy.settings.displayName;

        if(_buddy.profileImg && _buddy.profileImg.url != ''){
          _buddy.avatar = _buddy.profileImg.url;
        }else if(_buddy.photoURL){
          _buddy.avatar = _buddy.photoURL;
        }else{
          _buddy.avatar = './assets/img/man.svg';
        }

      });
      this.buddiesRequest = friendRequests;
    })
  }

  joinEvent(event, state, index, clickEvent: Event){
    clickEvent.stopPropagation();
    let currentUserId = this.currentUser.uid;
    let eventKey = event.key;

    this.buddiesProvider.getParticipantsID(event.aFuid, eventKey);
    let participant = {};
    participant[currentUserId] = state;

    let notifs = this.eventsNotifications.filter(res => res.eventKey == eventKey );
    if(notifs.length){
      this.notifications.deleteNotif(currentUserId, notifs[0].key);
    }
    this.buddiesEvents.splice(index, 1);
    this.buddiesProvider
      .updateParticipants(participant)
      .then( () => {
        if(state && event.oneSignalId){
          this.buildMessageToFriend(event.oneSignalId, this.userData.settings.displayName, 'joinedEvent', event);
        }
      });
  }

  acceptFriendRequest(index){
    let buddy = this.buddiesRequest[index];
    let { aFuid, displayName, oneSignalId = null} = buddy;
    //console.log(`send notif to "${displayName}" from "${this.userData.displayName} - ${this.userData.aFuid}" @ "${oneSignalId}" after updating database for "${aFuid}"`);

    this.userData.buddies[aFuid].pending = false;
    //let data = this.userData;
    this.userProvider.updateUserData(this.userData).subscribe((_userData) => {
      if(_userData){
        //add new buddie to the ASKER
        let asker = {
          pending: false,
          oneSignalId: _userData.oneSignalId || null,
          user_id: _userData.aFuid
        }
        this.afdb.object(`/users/${aFuid}/buddies/${_userData.aFuid}`).update(asker);
        //send message to the ASKER
        if(oneSignalId && _userData.oneSignalId){
          this.buildMessageToFriend(oneSignalId, this.userData.settings.displayName, 'friendRequestAccepted', _userData);
        }
        buddy.pending = false;
        this.requestAccepted.push(buddy);
        this.buddies.splice(index, 1);
      }
    })
  }


  buildMessageToFriend(oneSignalId, name, type, recipientData = null){
    let data = {
      type: type,
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid
      },
      displayName: name,
      to: {
        user_id: recipientData.aFuid
      },
      event:null
    };

    let contents = {};

    if(type == 'friendRequestAccepted'){
      contents = {
        en: `You are now connected to ${name}`,
        fr: `Vous êtes maintenant connecté à ${name}`
      }
    }else if(type == 'joinedEvent'){
      let eventName = recipientData.name;
      let timestamp = moment().unix();

      data.event = {
        id: recipientData.key,
        timestamp: timestamp
      }
      contents = {
        en: `${name} is going to your event "${eventName}"`,
        fr: `${name} participe à votre événement "${eventName}"`
      }
    }

    this.notifications.sendMessage([oneSignalId], data, contents, null );
  }

  getBadges(uid:string){
    this.badgesNotifSubscription = this.notifications.fetchById(uid).subscribe(res => {
      if(res){
        let toRead = res.map((c) => {
          let eventKey = null;
          let payload = c.payload.val();
          if(payload.data.event && payload.data.event.id){
            eventKey = payload.data.event.id;
          }
          return { key: c.key, eventKey, ...payload };
        });

        //this.eventsNotifications = toRead.filter(res => res.data.type === 'joinedEvent' || res.data.type === 'newEvent');
        //this.requestsNotifications = toRead.filter(res => res.data.type === 'friendRequest' || res.data.type === 'friendRequestAccepted');
        this.eventsNotifications = toRead.filter(res => res.data.type === 'newEvent');
        this.requestsNotifications = toRead.filter(res => res.data.type === 'friendRequest');

        this.badges['events'] = this.eventsNotifications.filter(res => res.read === false).length;
        this.badges['requests'] = this.requestsNotifications.filter(res => res.read === false).length;

        this.clearBadges(this.messages);
      }
    });
  }

  clearBadges(type:string){
    setTimeout(() => {
      let notifsToUpdate = this[`${this.messages}Notifications`];
      for(let notif of notifsToUpdate){
        this.notifications.setNotifState(notif.key, true);
      }
    }, 2000);
  }

  segmentChanged(action){
    this.clearBadges(action.value);
  }

  presentMapModal(event, place){
    if(!event.displayName) event.displayName = this.userData.displayName;
    let values = { event, place };
    this.mapModal = this.modalCtrl.create('ModalNavPage', { state: 'display_place_event',values: place, page: 'MapPage', event });
    this.mapModal.present();
    this.mapModal.onDidDismiss(data => {
      this.showMapIsEnabled = null;
    })
  }
  showMap(index){
    if(this.showMapIsEnabled === null){
      this.showMapIsEnabled = index;
      let event = this.buddiesEvents[index];

      for(let uid in event.participants){
        if(event.participants[uid] === true){
          this.buddiesProvider.getUserByID(uid).subscribe(res => {
            if(res){
              this.buddiesProvider.eventsParticipantsList.push(res)
            }
          });
        }
      }
      if(event.place_id){
        this.placesProvider.getById(event.place_id).subscribe(place => {
          this.presentMapModal(event, place);
        });
      }else{
        this.presentMapModal(event, {});
      }
    }

  }

}
