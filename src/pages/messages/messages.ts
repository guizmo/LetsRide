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

  ionViewDidLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMessages(user){
    this.user = user;
    this.messagesProvider.getAllThreads(this.user.aFuid)
      .takeUntil(this.ngUnsubscribe)
      .subscribe( (threads) => {
        threads.forEach((thread, index) => {
          let bud;
          if(this.buddies.length && ( bud = this.buddies.find(bud => bud.aFuid == thread.key) ) ){
            thread.displayName = bud.displayName;
            this.messages.splice(index, 0, thread);
          }else{
            this.fetchUsername(thread, index);
          }
        });
    });
  }

  fetchUsername(thread, index){
    this.buddiesProvider.getUserByID(thread.key)
      .take(1)
      .subscribe( (user) => {
        thread.displayName = this.utils.getDisplayName(user);
        thread.profileImgPath = this.utils.getProfileImg(user);
        this.messages.splice(index, 0, thread);
      });
  }

  updateUrl(event: Event, array, index) {
    array[index].profileImgPath = './assets/img/man.svg';
  }

  showMessage(message){
    this.navCtrl.push('MessageThreadPage', {message, me:this.user});
  }

}
