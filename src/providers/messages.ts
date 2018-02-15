import { Injectable } from '@angular/core';

import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from "rxjs/Rx";
import { Subject } from 'rxjs/Subject';


@Injectable()
export class MessagesProvider {

  buddy: any;
  conversation: any;
  messages = [];

  public threadsRef:AngularFireList<any[]>;
  public threads: Observable<any[]>;

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
    this.threadsRef = this.afdb.list(`/messages/list/${uid}/`, ref => ref.orderByChild('timestamp') );
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

  getThreadId(uid, to_uid) {
    return this.afdb.object(`/messages/list/${uid}/${to_uid}/`).valueChanges();
  }

  getThread(threadId) {
    this.threadRef = this.afdb.list(`/messages/objects/${threadId}/thread/`, ref => ref.orderByChild('timestamp').limitToLast(50))
    this.thread = this.threadRef.snapshotChanges(['child_added']).map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    return this.thread;
  }


  createThread(details, msg, to_uid) {
    console.log(details, msg, to_uid);
    let from = {};
    let to = {};
    let from_uid = details.creator_id;
    from[from_uid] = {};
    to[to_uid] = {};
    let detail = {
      timestamp: details.timestamp,
      unseenCount: 1
    }
    from[to_uid] = detail;
    to[from_uid] = detail;
    //Create un object and save key in both user list
    let messageObjects = this.afdb.list(`/messages/objects/`);
    messageObjects.push({details: details}).then(thread => {
      let threadId = thread.key;
      from[to_uid]['threadId'] = threadId;
      to[from_uid]['threadId'] = threadId;
      this.afdb.object(`/messages/list/${from_uid}`).update(from);
      this.afdb.object(`/messages/list/${to_uid}`).update(to);

      console.log(threadId);
      this.hasThread.next(threadId);
      this.hasThread.complete();
      this.addMessage(msg);
    });
  }

  addMessage(msg) {
    this.threadRef.push(msg).then(res => {
      this.threadDetailsRef.update({last_msg_added: res.key})
    })
  }


}
