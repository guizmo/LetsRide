import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

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

  public messages: string = "requests";

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
      this.buddiesProvider.getBuddies(this.currentUser.uid);

      this.getBuddies(this.currentUser.uid);
      this.getBuddiesEvents(this.currentUser.uid);
      this.getBuddiesRequest(this.currentUser.uid);
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

  getBuddies(uid:string){
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((buddies) => {
      console.log(buddies);
      this.buddies = buddies;
    })
  }


  getBuddiesEvents(uid:string){
    this.buddiesEventsSubscription = this.buddiesProvider.buddiesEvents.subscribe((events) => {
      console.log('getBuddiesEvents', events);
      let _events = [];
      let buddyEvents = events.filter((event) => event.$exists()).map((event) => {
        let bud = this.buddies.filter((_bud) => _bud.$key === event.$key)[0];
        let buddy = {
          displayName: bud.settings.displayName,
          oneSignalId: bud.oneSignalId,
          aFuid: bud.$key
        };

        for (let key in event) {
          _events.push(Object.assign(event[key], buddy));
        }
        //event.map((ev) => console.log(ev))
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
      this.buddiesRequest = friendRequests;
    })
  }

  ionViewWillUnload(){
    this.buddiesSubcription.unsubscribe();
    this.buddiesEventsSubscription.unsubscribe();
    this.buddiesRequestSubscription.unsubscribe();
  }



  acceptFriendRequest(index){
    let buddy = this.buddies[index];
    let { aFuid, displayName, oneSignalId} = buddy;
    //console.log(`send notif to "${displayName}" from "${this.userData.displayName} - ${this.userData.aFuid}" @ "${oneSignalId}" after updating database for "${aFuid}"`);

    this.userData.buddies[aFuid].pending = false;
    //let data = this.userData;
    this.userProvider.updateUserData(this.userData).subscribe((_userData) => {
      if(_userData){
        //add new buddie to the ASKER
        let asker = {
          pending: false,
          oneSignalId: _userData.oneSignalId,
          user_id: _userData.aFuid
        }
        this.afdb.object(`/users/${aFuid}/buddies/${_userData.aFuid}`).update(asker);
        //send message to the ASKER
        this.sendMessageFriendRequestAccepted(oneSignalId, this.userData.settings.displayName);
        buddy.pending = false;
        this.requestAccepted.push(buddy);
        this.buddies.splice(index, 1);
      }
    })
  }


  sendMessageFriendRequestAccepted(oneSignalId, name){
    let data = {
      type: 'friendRequestAccepted',
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid
      },
      displayName: name
    };
    let contents = {
      'en': `You are now connected to ${name}`
    }
    this.notifications.sendMessage([oneSignalId], data, contents);
  }

}
