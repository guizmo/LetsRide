import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, PopoverController, ItemSliding, Item } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

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

  public eventModal;
  public events:FirebaseListObservable<any[]>;

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
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();
        this.events = this.afdb.list(`/events/${user.uid}`);
        this.userProvider.userData.subscribe((settings) => {
          if(settings){
            this.userData = settings;
          }
        });
      }
    });
  }

  ionViewDidLoad() {
    console.log(this);
  }

  presentPopover(event) {
    console.log(event);
    let popover = this.popoverCtrl.create('EventPage', {
      values: event
    });
    console.log(popover);
    popover.present();
  }

  presentEventModal(){
    this.eventModal = this.modalCtrl.create('EventsModalPage', null, { cssClass: 'inset-modal' })
    this.eventModal.present();

    this.onDismiss();
  }

  onDismiss(){
    this.eventModal.onDidDismiss(data => {
      console.log(data);
      //Add or update
      this.addOrUpdateEvent(data);
      //this.updateEvent(data);
    });
  }


  addOrUpdateEvent(data){
    this.events.update('myEvent2', data);
  }

  // updateEvent(data){
  //   this.events.update('myEvent1', data);
  // }




  openOptionRight() {
    this.activeItemSliding = true;
    let swipeAmount = 194; //set your required swipe amount

    this.eventsSliding.forEach( (sliding, index)  => {
      console.log(sliding);

      sliding.startSliding(swipeAmount);
      sliding.moveSliding(swipeAmount);

      sliding.setElementClass('active-options-right', true);
      sliding.setElementClass('active-swipe-right', true);

    });
    this.eventsItem.forEach( (item, index)  => {
      console.log(item);
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

}
