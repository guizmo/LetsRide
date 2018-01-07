import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';
import * as moment  from 'moment';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, NotificationsProvider, BuddiesProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  public eventsNotifications: any = [] ;
  public requestsNotifications: any = [] ;

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
  private buddiesSubcription;

  public messages: string = "events";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private buddiesProvider: BuddiesProvider,
    private notifications: NotificationsProvider
  ) {
    //test
    //this.messages = 'requests';
    //test

    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.userProvider.getUserData().subscribe((settings) => {
          if(settings){
            this.userData = settings;
            this.currentUser = user.toJSON();
            this.loadAll();
            this.getBadges(this.currentUser.uid);
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
    this.buddiesEventsSubscription.unsubscribe();
    this.buddiesRequestSubscription.unsubscribe();
  }

  loadAll(){
    this.buddiesProvider.getBuddies(this.currentUser.uid);
    this.getBuddies(this.currentUser.uid);
    this.getBuddiesEvents(this.currentUser.uid);
    this.getBuddiesRequest(this.currentUser.uid);
  }

  getBuddies(uid:string){
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((buddies) => {
      if(buddies.length){
        this.buddies = buddies;
        console.log('buddies', buddies);
        this.listenToBuddiesEvents(buddies);
      }
    });

    this.buddiesProvider.buddiesId.subscribe((buddies) => {
      if(buddies.length){
        //auto refresh: subscribe to all buddies events
        //this.listenToBuddiesEvents(buddies);
      }
    })
  }

  listenToBuddiesEvents(buddies){
    for(let buddy of buddies){
      this.buddiesProvider.refreshBuddiesEvents(buddy.aFuid).subscribe((events) => {
        if(events){
          this.buddiesProvider.getBuddiesEvents(buddies);
        }
      })
    }
  }

  getBuddiesEvents(uid:string){
    let now = moment();
    this.buddiesEventsSubscription = this.buddiesProvider.buddiesEvents.subscribe((events) => {
      let _events = [];
      let buddyEvents = Object.keys(events).filter((bud_key) => events[bud_key] )
        .map((bud_key) => {
          let bud_events = events[bud_key];
          let bud = this.buddies.filter((_bud) => _bud.aFuid === bud_key );
          bud = bud[0] || null;
        if(bud){
          let buddyEvent = {
            displayName: bud.settings.displayName,
            oneSignalId: bud.oneSignalId || null,
            aFuid: bud.aFuid
          };

          for (let key in bud_events) {
            let event = bud_events[key];
            event.key = key;
            event.participates = false;
            let eventTime = moment(event.time);
            if (eventTime.diff(now) >= 0){
              if(event.participants && event.participants[this.currentUser.uid]){
                event.participates = true;
              }
              _events.push(Object.assign(event, buddyEvent));
            }
          }
        }
        return _events;
      })
      _events.sort(function(a,b) {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });
      this.buddiesEvents = _events;
    })
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

  joinEvent(event, state){
    this.buddiesProvider.getParticipants(event.aFuid, event.key);
    let participant = {};
    participant[this.currentUser.uid] = state;

    this.buddiesProvider
      .updateParticipants(participant)
      .then(res => {
        if(state && event.oneSignalId){
          this.sendMessageToFriend(event.oneSignalId, this.userData.settings.displayName, 'joinedEvent', event);
        }
        this.loadAll();
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
          this.sendMessageToFriend(oneSignalId, this.userData.settings.displayName, 'friendRequestAccepted', _userData);
        }
        buddy.pending = false;
        this.requestAccepted.push(buddy);
        this.buddies.splice(index, 1);
      }
    })
  }


  sendMessageToFriend(oneSignalId, name, type, recipientData = null){
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
      contents['en'] = `You are now connected to ${name}`;
      contents['fr'] = `Vous êtes maintenant connecté à ${name}`;
    }else if(type == 'joinedEvent'){
      let eventName = recipientData.name;
      let timestamp = moment().unix();

      data.event = {
        id: recipientData.key,
        timestamp: timestamp
      }
      contents['en'] = `${name} is going to your event "${eventName}"`;
      contents['fr'] = `${name} participe à votre événement "${eventName}"`;
    }

    this.notifications.sendMessage([oneSignalId], data, contents, null );
  }

  getBadges(uid:string){
    this.notifications.fetchById(uid).subscribe(res => {
      if(res){
        let toRead = res.map((changes) => ({ key: changes.key, ...changes.payload.val() }) ).filter(res => {
          return res.read === false;
        });

        let eventsTmp = {};
        let uniq = toRead.reverse().filter( notif => {
          let event_id = notif.data.event.id;
          if(!eventsTmp[event_id]){
            eventsTmp[event_id] = notif;
            return true;
          }
        });

        this.eventsNotifications = toRead.filter(res => res.data.type === 'joinedEvent');
        this.requestsNotifications = toRead.filter(res => res.data.type === 'friendRequest' || res.data.type === 'friendRequestAccepted');

        this.badges['events'] = uniq.filter(res => res.data.type === 'joinedEvent').length;
        this.badges['requests'] = uniq.filter(res => res.data.type === 'friendRequest' || res.data.type === 'friendRequestAccepted').length;

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

}
