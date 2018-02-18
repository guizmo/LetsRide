import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, BuddiesProvider, UtilsProvider, MessagesProvider } from '../../providers';

//https://www.skcript.com/svr/how-to-structure-firebase-database-for-a-scalable-chat-app/
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

  activeMenu = 'MessagesPage';
  buddies = [];
  messages = [];
  user;
  timeChanged = 0;

  private ngUnsubscribe:Subject<void> = new Subject();

  constructor(
    private buddiesProvider: BuddiesProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public utils: UtilsProvider,
    public messagesProvider: MessagesProvider
  ) {
    console.log(this);
    this.buddiesProvider.buddies.takeUntil(this.ngUnsubscribe).subscribe((buddies) => {
      this.buddies = buddies;
    });

    if(this.userProvider.userObject){
      this.getMessages(this.userProvider.userObject);
    }

    this.userProvider.getUser().takeWhile(user => !this.user).subscribe(user => {
      if(user){
        this.getMessages(user);
      }
    });
  }

  ionViewWillUnload(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getMessages(user){
    this.user = user;
    this.messagesProvider.getAllThreads(this.user.aFuid)
      .takeUntil(this.ngUnsubscribe)
      .subscribe( (threads) => {
        if(!this.messages.length){
          this.messages = threads;
          this.fetchUsername(this.messages);
        }else{
          this.UpdateMsgList(threads);
        }
    });
  }


  UpdateMsgList(newThreads){
    this.messages.map((thread, index) => {
      let newThread = newThreads.find(res => res.key == thread.key)
      if(thread.timestamp != newThread.timestamp || thread.unseenCount != newThread.unseenCount){
        thread.timestamp = newThread.timestamp;
        thread.unseenCount = newThread.unseenCount;
        thread.dateFormat = this.utils.dateTransform(thread.timestamp);
        this.timeChanged++;
        return thread;
      }
    })
  }

  fetchUsername(items){
    items.forEach((thread, index) => {
      thread.dateFormat = this.utils.dateTransform(thread.timestamp);
      let bud;
      if(this.buddies.length && ( bud = this.buddies.find(bud => bud.aFuid == thread.key) ) ){
        thread.displayName = bud.displayName;
        thread.profileImgPath = bud.profileImgPath;
      }else{
        this.buddiesProvider.getUserByID(thread.key)
          .take(1)
          .subscribe( (user) => {
            thread.displayName = this.utils.getDisplayName(user);
            thread.profileImgPath = this.utils.getProfileImg(user);
          });
      }
    });
  }

  updateUrl(event: Event, thread) {
    let index = this.messages.findIndex(res => res.key == thread.key);
    this.messages[index].profileImgPath = './assets/img/man.svg';
  }

  showMessage(threadDetails){
    this.navCtrl.push('MessageThreadPage', {message:threadDetails, me:this.user});
    setTimeout(() => {
      this.messageread(threadDetails);
    }, 400)
  }
  messageread(threadDetails){
    if(threadDetails.unseenCount == 1){
      this.messagesProvider.messageRead(threadDetails.key);
    }
  }

  removeThread(thread){
    let threadDetails = {
      from_uid: this.user.aFuid,
      to_uid: thread.key,
      threadId: thread.threadId
    }
    this.messagesProvider.removeThread(threadDetails);
    let index = this.messages.findIndex(res => res.key == thread.key);
    this.messages.splice(index, 1);
  }

}
