import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

import { UserProvider, NotificationsProvider} from '../../../providers';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

  userData;
  currentUser;
  messagesFrom;
  buddies;
  requestAccepted: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private notifications: NotificationsProvider
  ) {
    console.log(this);
  }
  //ionViewDidEnter = everytime

  ionViewDidEnter() {
    console.log('ionViewDidLoad MessagesPage');
    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      this.getMessages(this.currentUser.uid);
      return;
    }

    this.navParams.data.subscribe(
      values => {
        if(values){
          console.log('this.navParams.data.subscribe');
          console.log(values);
          let key = Object.keys(values)[0];
          for (let key in values) {
            this[key] = values[key];
          }
          this.getMessages(this.currentUser.uid);
        }
      },
      error => console.log('error'),
      () => { }
    );
  }


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
              console.log('snapshots', snapshotsMaped)
              for (let snapshot of snapshotsMaped) {
                let buddy = {
                  displayName: snapshot.settings.displayName,
                  photoURL: snapshot.photoURL,
                  aFuid: snapshot.aFuid,
                  oneSignalId: snapshot.oneSignalId,
                  pending: true
                }
                console.log(buddy);
                buddies.push(buddy);
              }

              this.buddies = buddies;
            }
          });
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );

  }

  acceptFriendRequest(index){
    let buddy = this.buddies[index];
    let { aFuid, displayName, oneSignalId} = buddy;
    console.log(`send notif to "${displayName}" from "${this.userData.displayName} - ${this.userData.aFuid}" @ "${oneSignalId}" after updating database for "${aFuid}"`);

    this.userData.buddies[aFuid].pending = false;
    let data = this.userData;

    console.log(data);
    //this.sendMessageFriendRequestAccepted(oneSignalId, displayName, index);
    this.userProvider.updateUserData(data).subscribe((userData) => {
      if(userData){
        this.sendMessageFriendRequestAccepted(oneSignalId, displayName);
        this.buddies[index].pending = false;
        this.requestAccepted.push(this.buddies[index]);
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
