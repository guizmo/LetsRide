import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, BuddiesProvider, UtilsProvider, MessagesProvider } from '../../providers';

//https://www.skcript.com/svr/how-to-structure-firebase-database-for-a-scalable-chat-app/


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
        //console.log(threads);
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
      if(thread.timestamp != newThread.timestamp){
        console.log(newThread);
        console.log('new threads =', newThread.timestamp );
        console.log('this.message =', thread.timestamp );
        console.log('Test if right object', thread.key);
        thread.timestamp = newThread.timestamp;
        thread.unseenCount = newThread.unseenCount;
        this.timeChanged++;
        return thread;
      }
    }).slice();
    //let modifiedMessage = this.messages.filter((thread, index) => !thread.timestamp != threads[index].timestamp );
    //console.log(modifiedMessage);
  }

  fetchUsername(items){
    items.forEach((thread, index) => {
      let bud;
      if(this.buddies.length && ( bud = this.buddies.find(bud => bud.aFuid == thread.key) ) ){
        thread.displayName = bud.displayName;
        thread.profileImgPath = bud.profileImgPath;
        //this.messages.splice(index, 0, thread);
      }else{
        this.buddiesProvider.getUserByID(thread.key)
          .take(1)
          .subscribe( (user) => {
            thread.displayName = this.utils.getDisplayName(user);
            thread.profileImgPath = this.utils.getProfileImg(user);
            //this.messages.splice(index, 0, thread);
          });
      }
    });
  }

  updateUrl(event: Event, array, index) {
    array[index].profileImgPath = './assets/img/man.svg';
  }

  showMessage(threadDetails){
    this.navCtrl.push('MessageThreadPage', {message:threadDetails, me:this.user});
  }

  removeThread(threadDetails){

  }

}
