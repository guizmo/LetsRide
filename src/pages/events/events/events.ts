import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController, ItemSliding, Item } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MomentModule } from 'angular2-moment';
import * as moment  from 'moment';

import { UserProvider, NotificationsProvider, DisciplinesProvider} from '../../../providers';

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
  public oneSignalBuddiesId: any = [];
  public eventsListing: any = [];
  private disciplines:ReadonlyArray<any>;
  private showSpinner:boolean = true;
  private showNoResult:boolean = false;

  constructor(
    public disciplinesProvider: DisciplinesProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private notifications: NotificationsProvider,
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController
  ) {
    moment.locale('en-gb');
    this.disciplinesProvider.findAll().subscribe(
      data => this.disciplines = data
    );
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();
        this.events = this.afdb.list(`/events/${user.uid}`, {
          query: {
            orderByChild: 'time'
          }
        })

        this.events.map((events) => {
          let now = moment();
          return events
            .filter((event) => {
              let eventTime = moment(event.time);
              return (eventTime.diff(now) >= 0);
            })
            .map((event) => {

              let style = 'default.png';
              if(event.disciplines){
                style = this.getRidingStyle(event.disciplines)+'.jpg';
              }
              event.backgroundImage = `./assets/img/styles/${style}`;
              return event;
            });
        }).subscribe((events) => {
          if(events){
            this.eventsListing = events;
            this.showSpinner = false;

            this.showNoResult = (events.length < 1) ? true : false ;

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
        if(this.oneSignalBuddiesId.length && message && this.userData.oneSignalId){
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

    let confirm = this.alertCtrl.create({
      title: 'Deleting !',
      message: 'You are going to permanently delete this event !',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.events.remove(key);
          }
        }
      ]
    });
    confirm.present();
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
          this.oneSignalBuddiesId = _buddies.filter(buddie => buddie.oneSignalId).map(buddie => buddie.oneSignalId);
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

  getRidingStyle(value: string){
    let discipline = this.disciplines.filter( disciplineVal => disciplineVal.name == value )[0];
    return discipline.alias;
  }

}
