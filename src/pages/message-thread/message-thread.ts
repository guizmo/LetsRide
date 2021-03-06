import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Content, TextInput, Button } from 'ionic-angular';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { UtilsProvider, MessagesProvider } from '../../providers';
import * as moment  from 'moment';

@IonicPage()
@Component({
  selector: 'page-message-thread',
  templateUrl: 'message-thread.html',
})
export class MessageThreadPage {
  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  @ViewChild('sendButton') sendButton:Button;

  threadDetail;
  chats:Array<any> = [];
  chatDetails;
  user;
  editorMsg = '';
  textArea;
  viewState;
  footerIsHidden:boolean = false;
  showSpinner:boolean = true;
  showNoResult:boolean = false;
  reOpenFlag:boolean = false;

  private ngUnsubscribe:Subject<void> = new Subject();

  constructor(
    public utils: UtilsProvider,
    public messagesProvider: MessagesProvider,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.threadDetail = this.navParams.get('message');
    if(!this.threadDetail) this.navCtrl.setRoot('MessagesPage');
    this.user = this.navParams.get('me');
    this.viewState = (this.threadDetail && !this.threadDetail.threadId) ? 'create' : 'exist';
    console.log(this);
  }

  ionViewDidLoad(){
    if(!this.threadDetail) return;
    this.messagesProvider.setUsersThreadRef(this.user.aFuid, this.threadDetail.key);
    if(this.viewState == 'exist'){
      this.initChat();
    }else{
      //check if this.toUserThreadRef exist
      this.messagesProvider.toUserthreadExist().take(1).subscribe( (res) => {
        console.log('toUserthreadExist', res);
        if(res && res.threadId){
          this.reOpenFlag = true;
          this.viewState = 'exist';
          this.threadDetail.threadId = res.threadId;
          this.initChat();
        }
      });

      this.showSpinner = false;
      this.messagesProvider.hasThread.subscribe( (res) => {
        this.viewState = 'exist';
        this.threadDetail.threadId = res;
        this.initChat();
      });
    }
  }

  ionViewWillLeave(){
    //visully hide footer on leave
    this.footerIsHidden = true;
    //update seenCount
    if(this.threadDetail) this.messageRead();
  }

  initChat(){

    let threadId = this.threadDetail.threadId;
    this.messagesProvider.getThreadDetails(threadId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe( res => {
        this.chatDetails = res;
      });
    console.log('created on ', this.threadDetail.created_date);
    this.messagesProvider.getThread(threadId, this.threadDetail.created_date)
      .takeUntil(this.ngUnsubscribe)
      .subscribe( res => {
        let duration = !this.chats.length ? 0 : 300;
        let notPresentInData = res.filter((val, index) => !this.chats[index]);
        notPresentInData.forEach(r => {
          r.dateFormat = this.utils.dateTransform(r.timestamp);
          this.chats.push(r);
        });
        this.scrollToBottom(duration);
      });

    this.user.profileImgPath = this.utils.getProfileImg(this.user);
  }

  messageRead(){
    if(this.threadDetail.unseenCount == 1){
      this.messagesProvider.messageRead(this.threadDetail.key);
    }
  }

  updateUrl(event: Event, item) {
    this[item].profileImgPath = './assets/img/man.svg';
  }


  sendMsg() {
    let payload = this.editorMsg.trim();
    if (!payload) return;
    let timestamp = moment().valueOf();
    let message = {
      timestamp,
      payload,
      user_id: this.user.aFuid,
      state: false
    }

    if(this.viewState == 'exist'){
      let threadId = ( this.reOpenFlag === true ) ? this.threadDetail.threadId : null ;
      this.messagesProvider.addMessage(message, threadId);
    }else{
      //New thread creation
      console.log('New thread creation');
      let details = {
        timestamp,
        creator_id: this.user.aFuid,
        last_msg_added: '',
        state: false
      }
      this.messagesProvider.createThread(details, message, this.threadDetail.key);
    }

    this.editorMsg = '';
    this.messageInput.setFocus();
    this.adjust(false);
  }


  ionViewDidEnter(){
    this.textArea = this.messageInput._native.nativeElement;
    //https://github.com/ionic-team/ionic-plugin-keyboard/issues/81#issuecomment-278071581
    let el = this.sendButton._elementRef.nativeElement;
    el.addEventListener('click', (event) => {
      this.stopBubble(event);
    });
    el.addEventListener('mousedown', (event) => {
      this.stopBubble(event);
    });
    el.addEventListener('touchdown', (event) => {
      this.stopBubble(event);
    });
    el.addEventListener('touchmove', (event) => {
      this.stopBubble(event);
    });
    el.addEventListener('touchstart', (event) => {
      this.stopBubble(event);
    });
    el.addEventListener('touchend', (event) => { //Triggered by a phone
      this.stopBubble(event);
      this.sendMsg();
    });
    el.addEventListener('mouseup', (event) => { //Triggered by the browser
      this.sendMsg();
    });

  }

  stopBubble(event) {
    event.preventDefault();
    event.stopPropagation(); //Stops event bubbling
  }

  onFocus() {
    this.content.resize();
    this.scrollToBottom();
    this.messageInput.ngControl.valueChanges.subscribe(() => {
      this.adjust(true);
    });
  }

  onBlur(event:Event) {
  }


  adjust(state):void {
    this.textArea.style.overflow = 'hidden';
    this.textArea.style.height = 'auto';
    if(state){
      this.textArea.style.height = this.textArea.scrollHeight + "px";
    }
    this.content.resize();
    this.scrollToBottom();
  }

  scrollToBottom(duration = 300) {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(duration);
        if(this.showSpinner){
          this.showSpinner = false;
        }
      }
    }, 400)
  }


}
