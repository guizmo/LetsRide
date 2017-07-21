import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase
  ) {
    console.log(this);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagesPage');

    if(this.navParams.data){
      this.navParams.data.subscribe(
        value => {
          if(value){
            let key = Object.keys(value)[0];
            this[key] = value[key];
            if(key == 'currentUser'){
              this.getMessages(this.currentUser.uid);
            }
          }
        },
        error => console.log('error'),
        () => { }
      );
    }
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
                  oneSignalId: snapshot.oneSignalId
                }
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

  //ionViewDidEnter = everytime

}
