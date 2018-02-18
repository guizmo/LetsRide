import { Injectable } from '@angular/core';

import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from "rxjs/Rx";
import { Subject } from 'rxjs/Subject';


@Injectable()
export class MessagesProvider {

  buddy: any;
  conversation: any;
  //messages = [];

  public threadsRef:AngularFireList<any[]>;
  public threads: Observable<any[]>;

  public fromUserThreadRef:AngularFireObject<any>;
  public toUserThreadRef:AngularFireObject<any>;
  public threadDetailsRef:AngularFireObject<any>;
  public threadRef:AngularFireList<any>;
  public threadDetails: Observable<any>;
  public thread: Observable<any>;
  public hasThread:Subject<void> = new Subject();

  constructor(
    public afdb: AngularFireDatabase,
  ) {
    console.log('Hello MessagesProvider Provider');
  }


  getAllThreads(uid) {
    this.threadsRef = this.afdb.list(`/messages/list/${uid}/`, ref => ref.orderByChild('timestamp').limitToLast(50) );
    this.threads = this.threadsRef.snapshotChanges(['child_added', 'child_changed']).map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    return this.threads;
  }

  getThreadDetails(threadId) {
    this.threadDetailsRef = this.afdb.object(`/messages/objects/${threadId}/details/`);
    this.threadDetails = this.threadDetailsRef.valueChanges();
    return this.threadDetails;
  }

  setUsersThreadRef(from_uid,to_uid){
    this.fromUserThreadRef = this.afdb.object(`/messages/list/${from_uid}/${to_uid}/`);
    this.toUserThreadRef = this.afdb.object(`/messages/list/${to_uid}/${from_uid}/`);
  }


  getThreadId(uid, to_uid) {
    return this.afdb.object(`/messages/list/${uid}/${to_uid}/`).valueChanges();
  }

  getThread(threadId, startAtTime) {
    this.threadRef = this.afdb.list(`/messages/objects/${threadId}/thread/`, ref => ref.orderByChild('timestamp').limitToLast(50).startAt(startAtTime))
    this.thread = this.threadRef.snapshotChanges(['child_added']).map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    return this.thread;
  }


  createThread(details, msg, to_uid) {
    let from = {};
    let to = {};
    let from_uid = details.creator_id;
    let detail = {
      created_date: details.timestamp,
      timestamp: details.timestamp,
      unseenCount: 1,
    }
    //Create un object and save key in both user list
    let messageObjects = this.afdb.list(`/messages/objects/`);
    messageObjects.push({details: details}).then(thread => {
      let threadId = thread.key;
      detail.threadId = threadId;
      from[to_uid] = detail;
      to[from_uid] = detail;
      this.afdb.object(`/messages/list/${from_uid}`).update(from);
      this.afdb.object(`/messages/list/${to_uid}`).update(to);
      this.hasThread.next(threadId);
      this.hasThread.complete();
      this.addMessage(msg);
    });
  }

  addMessage(msg, threadId:string = null) {
    let fromUserUpdate = {unseenCount: 0, timestamp: msg.timestamp  };
    if( threadId ) {
      fromUserUpdate.created_date = msg.timestamp;
      fromUserUpdate.threadId = threadId;
    }
    this.threadRef.push(msg).then(res => {
      this.threadDetailsRef.update({last_msg_added: res.key, timestamp: msg.timestamp  })
      this.fromUserThreadRef.update(fromUserUpdate)
      this.toUserThreadRef.update({unseenCount: 1, timestamp: msg.timestamp  })
    })
  }

  messageRead(uid){
    this.threadsRef.update(uid, {unseenCount:0})
  }

  removeThread(threadDetails){
    let { from_uid, to_uid, threadId } = threadDetails;
    this.afdb.object(`/messages/list/${from_uid}/${to_uid}`).remove();
    //this.afdb.object(`/messages/list/${to_uid}/${from_uid}`).remove();
    //this.afdb.object(`/messages/objects/${threadId}`).remove();
  }

  toUserthreadExist(){
    return this.toUserThreadRef.valueChanges();
  }


}
