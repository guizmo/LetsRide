import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController, ItemSliding, Item } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MomentModule } from 'angular2-moment';
import * as moment  from 'moment';

import { UserProvider, NotificationsProvider} from '../../../providers';

//https://forum.ionicframework.com/t/click-to-slide-open-ion-item-sliding-instead-of-swiping/54642/5
//http://blog.ihsanberahim.com/2017/05/trigger-ionitemsliding-using-click-event.html

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  @ViewChildren('eventsItem') eventsItem: QueryList<Item>;
  @ViewChildren('eventsSliding') eventsSliding: QueryList<ItemSliding>;

  private activeItemSliding:boolean = false;
  private userData;
  private currentUser;
  private itemInUpdateMode;

  public eventModal;
  public events:FirebaseListObservable<any[]>;
  public buddies:FirebaseListObservable<any[]>;
  public oneSignalBuddiesId: any = [] ;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private notifications: NotificationsProvider,
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {
    moment.locale('en-gb');
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();
        this.events = this.afdb.list(`/events/${user.uid}`, {
          query: {
            orderByChild: 'time'
          }
        });
        this.userProvider.userData.subscribe((settings) => {
          if(settings){
            this.userData = settings;
          }
        });

        this.getBuddies(user.uid);
      }
    });
  }

  ionViewDidLoad() {
    console.log(this);
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create('EventPage', {
      values: event
    });
    popover.present();
  }

  presentEventModal(event:any = null){

    if(event){
      this.itemInUpdateMode = event.$key;
    }
    this.eventModal = this.modalCtrl.create('EventsModalPage', {values: event}, { cssClass: 'inset-modal' })
    this.eventModal.present();

    this.onDismiss();
  }

  onDismiss(){
    this.eventModal.onDidDismiss(event => {
      if(event != null && event != 'cancel'){
        let name = this.userData.settings.displayName;
        let message = null ;
        let time = moment(event.time).format('lll');
        let contents = `Let's ride @ "${event.name}" -- ${time}`;
        //Add or update

        if(this.itemInUpdateMode){
          this.updateEvent(this.itemInUpdateMode, event);
          message = {
            headings: `${name} has changed an event`
          }
        }else{
          this.addEvent(event);
          message = {
            headings: `${name} has created an event`
          }
        }
        if(this.oneSignalBuddiesId.length && message){
          message.contents = contents;
          this.sendEventToBuddies(message);
        }

        this.itemInUpdateMode = null;

      }
    });
  }


  updateEvent(key, data){
    this.events.update(key, data);
  }

  addEvent(data){
    this.events.push(data);
  }

  deleteEvent(key){
    this.events.remove(key);
  }



  openOptionRight() {
    this.activeItemSliding = true;
    let swipeAmount = 160; //set your required swipe amount

    this.eventsSliding.forEach( (sliding, index)  => {
      sliding.startSliding(swipeAmount);
      sliding.moveSliding(swipeAmount);
      sliding.setElementClass('active-options-right', true);
      sliding.setElementClass('active-swipe-right', true);
    });
    this.eventsItem.forEach( (item, index)  => {
      item.setElementStyle('transition', null);
      item.setElementStyle('transform', 'translate3d(-'+swipeAmount+'px, 0px, 0px)');
    });

  }
  closeOption() {
    this.activeItemSliding = false;
    this.eventsSliding.forEach( (sliding, index)  => {
      sliding.close();
    });
  }




  getBuddies(uid:string){
    this.buddies = this.afdb.list(`/users/${uid}/buddies`,{
      query: {
        orderByChild: 'pending',
        equalTo: false
      }
    });

    this.buddies.subscribe(
      _buddies => {
        if(_buddies){
          console.log(_buddies);
          this.oneSignalBuddiesId = _buddies.map(buddie => buddie.oneSignalId);
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );
  }


  sendEventToBuddies(message){
    let name = this.userData.settings.displayName;
    let data = {
      type: 'newEvent',
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid
      },
      displayName: name
    };

    let contents = {
      'en': message.contents
    }
    let headings = {
      'en': message.headings
    }

    this.notifications.sendMessage(this.oneSignalBuddiesId, data, contents, headings)
      .then((res) => {
        console.log('message sent');
      })
      .catch((err) => {
        if(err == 'cordova_not_available'){
          console.log('message sent');
        }
      })
  }

}
