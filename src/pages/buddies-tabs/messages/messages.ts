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
  public buddies: any = [];
  public buddiesEvents: any = [];
  public requestAccepted: any = [];
  public messages: string = "requests";
  private buddiesEventsSubscription;
  private buddiesRequestSubscription;

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

      //this.getMessages(this.currentUser.uid);
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

  ionViewWillUnload(){
    this.buddiesEventsSubscription.unsubscribe();
    this.buddiesRequestSubscription.unsubscribe();
  }

  getBuddiesEvents(uid:string){
    this.buddiesEventsSubscription = this.buddiesProvider.buddiesEvents.subscribe((events) => {
      console.log('events', events);
      this.buddiesEvents = events;
    })
  }

  getBuddiesRequest(uid:string){
    this.buddiesRequestSubscription = this.buddiesProvider.buddiesRequest.subscribe((friendRequests) => {
      console.log(friendRequests);
      this.buddies = friendRequests;
    })
  }

  /*
  getMessages(uid:string){
    this.messagesFrom = this.afdb.list(`/users/${uid}/buddies`,{
      query: {
        orderByChild: 'pending',
        equalTo: true
      }
    });

    this.messagesFrom.subscribe(
      messages => {
        if(messages){
          let buddiesRequest = [];
          for(let persone of messages){
            buddiesRequest.push( this.afdb.object(`/users/${persone.$key}`, { preserveSnapshot: true }).first() );
          }
          let buddies = [];
          Observable.forkJoin(buddiesRequest).subscribe((snapshots) => {
            if(snapshots){
              let snapshotsMaped:any = snapshots.map( (snap:any) => snap.val() );
              //console.log('snapshots', snapshotsMaped)
              for (let snapshot of snapshotsMaped) {
                let buddy = {
                  displayName: snapshot.settings.displayName,
                  photoURL: snapshot.photoURL,
                  aFuid: snapshot.aFuid,
                  oneSignalId: snapshot.oneSignalId,
                  pending: true
                }
                //console.log(buddy);
                buddies.push(buddy);
              }

              //this.buddies1 = buddies;
            }
          });
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );

  }
  */

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
