import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';
import * as moment  from 'moment';

import { AngularFireDatabase } from 'angularfire2/database';

import { UserProvider, NotificationsProvider, BuddiesProvider} from '../../../providers';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

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
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private buddiesProvider: BuddiesProvider,
    private notifications: NotificationsProvider
  ) {
    console.log(this);
  }
  //ionViewDidEnter = everytime

  ionViewDidLoad() {
    //console.log('ionViewDidLoad MessagesPage');
    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      console.log('if value', this.currentUser.uid);
      this.loadAll();
      return;
    }

    this.navParams.data.subscribe(
      values => {
        console.log('subscribe navParams message', this.currentUser.uid);
        if(values){
          //console.log('this.navParams.data.subscribe');
          //console.log(values);
          let key = Object.keys(values)[0];
          for (let key in values) {
            this[key] = values[key];
          }
          //this.getMessages(this.currentUser.uid);
        }
      },
      error => console.log('error'),
      () => { }
    );
  }

  loadAll(){
    this.buddiesProvider.getBuddies(this.currentUser.uid);
    this.getBuddies(this.currentUser.uid);
    this.getBuddiesEvents(this.currentUser.uid);
    this.getBuddiesRequest(this.currentUser.uid);
  }

  getBuddies(uid:string){
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((buddies) => {
      this.buddies = buddies;
    })
  }


  getBuddiesEvents(uid:string){
    let now = moment();
    this.buddiesEventsSubscription = this.buddiesProvider.buddiesEvents.subscribe((events) => {
      let _events = [];
      let buddyEvents = events.filter((event) => event.$exists()).map((event) => {
        let bud = this.buddies.filter((_bud) => _bud.$key === event.$key);
        bud = bud[0] || null;
        if(bud){
          let buddy = {
            displayName: bud.settings.displayName,
            oneSignalId: bud.oneSignalId || null,
            aFuid: bud.$key
          };


          for (let key in event) {
            event[key].participates = false;
            let eventTime = moment(event[key].time);
            if (eventTime.diff(now) >= 0){
              if(event[key].participants && event[key].participants[this.currentUser.uid]){
                event[key].participates = true;
              }
              _events.push(Object.assign({key}, event[key], buddy));
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
      console.log('getBuddiesRequest', friendRequests);
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

  ionViewWillUnload(){
    this.buddiesSubcription.unsubscribe();
    this.buddiesEventsSubscription.unsubscribe();
    this.buddiesRequestSubscription.unsubscribe();
  }


  joinEvent(event, state){
    this.buddiesProvider.getParticipantsID(event.aFuid, event.key);
    let participant = {};
    participant[this.currentUser.uid] = state;

    this.buddiesProvider
      .updateParticipants(participant)
      .then(res => {
        if(state && event.oneSignalId){
          this.buildMessageToFriend(event.oneSignalId, this.userData.settings.displayName, 'joinedEvent', event);
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
      }
    };

    let contents = {};

    if(type == 'friendRequestAccepted'){
      contents['en'] = `You are now connected to ${name}`;
      contents['fr'] = `Vous êtes maintenant connecté à ${name}`;
    }else if(type == 'joinedEvent'){
      let eventName = recipientData.name;
      contents['en'] = `${name} is going to your event "${eventName}"`;
      contents['fr'] = `${name} participe à votre événement "${eventName}"`;
    }
    console.log(data);
    this.notifications.sendMessage([oneSignalId], data, contents, null );
  }


}
