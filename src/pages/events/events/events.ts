import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController, ItemSliding, Item } from 'ionic-angular';

import { Observable, BehaviorSubject, Subscription } from 'rxjs';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MomentModule } from 'angular2-moment';
import * as moment  from 'moment';

import { UserProvider, NotificationsProvider, DisciplinesProvider, BuddiesProvider, PlacesProvider, AlertProvider} from '../../../providers';

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

  public places: any = [];
  private activeItemSliding:boolean = false;
  private userData;
  private currentUser;
  private itemInUpdateMode;
  private refresher;
  private eventModal;
  private mapModal;
  public eventsRef: AngularFireList<any>;
  public events: Observable<any[]>;
  public buddiesEvents: any = [];
  public buddies: any = [] ;
  public oneSignalBuddiesId: any = [];
  public eventsListing: any = [];
  private disciplines:ReadonlyArray<any>;
  private showSpinner:boolean = true;
  private showNoResult:boolean = false;
  private buddiesEventsSubscription;
  private buddiesSubcription;

  constructor(
    public disciplinesProvider: DisciplinesProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase,
    private userProvider: UserProvider,
    private buddiesProvider: BuddiesProvider,
    private notifications: NotificationsProvider,
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private placesProvider: PlacesProvider,
    private alertProvider: AlertProvider,
    private popoverCtrl: PopoverController
  ) {
    moment.locale('en-gb');

    this.disciplinesProvider.findAll().subscribe(
      data => this.disciplines = data
    );
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();

        this.getBuddiesEvents();
        //this.getEvents(user.uid);
        this.getBuddies();

        this.listPlaces(user.uid);

        this.userProvider.getUserData().subscribe((settings) => {
          if(settings){
            this.userData = settings;
          }
        });

      }
    });


  }

  ionViewWillUnload(){
    this.buddiesEventsSubscription.unsubscribe();
    this.buddiesSubcription.unsubscribe();
  }

  ionViewDidLoad() {
    console.log(this);
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create('EventPage', {
      values: event
    }, {
      cssClass: 'events-popover-content'
    });
    popover.present();
    this.navParams.data = null;
  }

  presentEventModal(event:any = null){
    if(event){
      this.itemInUpdateMode = event.key;
    }
    this.eventModal = this.modalCtrl.create('EventsModalPage', { values: event, places: this.places }, { cssClass: 'inset-modal' })
    this.eventModal.present();

    this.onDismiss();
  }

  presentMapModal(event, place){
    let values = { event, place };
    console.log(values);
    this.mapModal = this.modalCtrl.create('ModalNavPage', { state: 'display_place_event',values: place, page: 'MapPage', event });
    this.mapModal.present();
  }


  getBuddiesEvents(){
    let now = moment();
    this.buddiesProvider.getBuddies(this.currentUser.uid);
    this.buddiesEventsSubscription = this.buddiesProvider.buddiesEvents.subscribe((events) => {
      let _events = [];
      let buddyEvents = Object.keys(events).filter((bud_key) => events[bud_key] ).map((bud_key) => {
        let bud_events = events[bud_key];
        let bud = this.buddies.filter((_bud) => _bud.aFuid === bud_key );
        bud = bud[0] || null;

        if(bud){
          let buddyEvent = {
            displayName: bud.settings.displayName,
            oneSignalId: bud.oneSignalId || null,
            aFuid: bud.aFuid,
            buddy: true
          };


          for (let key in bud_events) {
            let event = bud_events[key];
            let eventTime = moment(event.time);
            let style = 'default.png';
            if(event.disciplines){
              style = this.getRidingStyle(event.disciplines)+'.jpg';
            }
            event.backgroundImage = `./assets/img/styles/${style}`;
            event.key = key;
            if (eventTime.diff(now) >= 0){
              if(event.participants && event.participants[this.currentUser.uid]){
                event.participates = true;
              }
              _events.push(Object.assign(event, buddyEvent));
            }
          }//for loop

        }//if bud

      })

      this.buddiesEvents = _events;
      this.getEvents(this.currentUser.uid);

    })
  }


  getEvents(uid){
    this.eventsRef = this.afdb.list(`/events/${uid}`, ref => ref.orderByChild('time') )
    this.events = this.eventsRef.snapshotChanges();

    this.events.map((events) => {
      let now = moment();
      return events.map((changes) => {
        let event = { key: changes.key, ...changes.payload.val() };
          let eventTime = moment(event.time);
          if((now.diff(eventTime) >= 0)){
            //automatically remove old events
            this.eventsRef.remove(event.key);
          }
          let style = 'default.png';
          if(event.disciplines){
            style = this.getRidingStyle(event.disciplines)+'.jpg';
          }
          event.backgroundImage = `./assets/img/styles/${style}`;
          return event;
        })
        .filter((event) => {
          let eventTime = moment(event.time);
          return (eventTime.diff(now) >= 0);
        })
    }).subscribe((events) => {
      if(events){
        //this.eventsListing = events;
        this.mergeEvents(events);
      }
    });

  }

  onDismiss(){
    this.eventModal.onDidDismiss(data => {
      if(data != null && data != 'cancel'){
        let event = data.event;
        let name = this.userData.settings.displayName;
        let message:any = {} ;
        let time = moment(event.time).format('lll');
        //Add or update
        message.contents = `Riding "${event.name}" @ ${time}`;
        let eventKey;


        if(this.itemInUpdateMode){
          eventKey = this.itemInUpdateMode;
          if(data.create_place){
            let place = {userId:this.currentUser.uid, name: event.where};
            this.addPlace(place, eventKey);
          }else{
            this.updateEvent(eventKey, event);
          }
          message.headings = `${name} has updated an event`;
          this.sendEventToBuddies(message, eventKey);
        }else{
          message.headings = `${name} has created an event`;
          this.addEvent(event).then((event) => {
            this.sendEventToBuddies(message, event.key);
            if(data.create_place){
              let place = {userId:this.currentUser.uid, name: event.where};
              this.addPlace(place, event.key);
            }
          })
        }
        this.itemInUpdateMode = null;
      }
    });
  }

  addPlace(place:any, event_key:any) {
    this.placesProvider.add(place).then( res => {
      this.updateEvent(event_key, { place_id: res.key, where: place.name});
    })
  }

  updateEvent(key, data){
    this.eventsRef.update(key, data);
  }

  addEvent(data){
    return this.eventsRef.push(data);
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
            this.eventsRef.remove(key);
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

  getBuddies(){
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((_buddies) => {
      console.log(_buddies);
      if(_buddies){
        this.buddies = _buddies;
        this.oneSignalBuddiesId = _buddies.filter(buddie => buddie.oneSignalId).map(buddie => buddie.oneSignalId);
      }
    })
  }

  sendEventToBuddies(message, key){
    if(this.oneSignalBuddiesId.length && this.userData.oneSignalId){
      let name = this.userData.settings.displayName;
      let data = {
        type: 'newEvent',
        from: {
          oneSignalId: this.userData.oneSignalId,
          user_id: this.userData.aFuid
        },
        eventId:key,
        displayName: name
      };

      let contents = {
        'en': message.contents
      }
      let headings = {
        'en': message.headings
      }
      this.notifications.sendMessage(this.oneSignalBuddiesId, data, contents, headings);
    }
  }

  getRidingStyle(value: string){
    let discipline = this.disciplines.filter( disciplineVal => disciplineVal.name == value )[0];
    return discipline.alias;
  }

  mergeEvents(eventsListing){
    let newList = [...this.buddiesEvents, ...eventsListing].sort(function(a,b) {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
    this.eventsListing = newList;
    this.showSpinner = false;
    this.showNoResult = (newList.length < 1) ? true : false ;


    let that = this;
    setTimeout(function () {
      if(that.refresher){
        that.refresher.complete();
        that.refresher = null;
      }
    }, 2000)

    if(this.navParams.data && this.navParams.data.type == 'newEvent'){
      let event = this.eventsListing.filter(event => event.key == this.navParams.data.eventId);
      if(event.length){
        this.presentPopover(event[0]);
      }

    }
  }

  refreshList(refresher) {
    this.refresher = refresher;
    this.getBuddiesEvents();
  }

  listPlaces(uid:string){
    this.placesProvider.getAllByUser(uid).subscribe((data) => {
      this.places = data;
    });
  }

  showMap(index){

    let event = this.eventsListing[index];

    for(let uid in event.participants){
      if(event.participants[uid] === true){
        this.buddiesProvider.getParticipant(uid).subscribe(res => {
          if(res){
            this.buddiesProvider.eventsParticipantsList.push(res)
          }
        });
      }
    }




    if(event.place_id){
      event.showMapIsEnabled = false;
      this.placesProvider.getById(event.place_id).subscribe(place => {
        if(place && place.lat && place.lng){
          this.presentMapModal(event, place);
        }else{
          this.alertProvider.showErrorMessage('places/none');
        }
        event.showMapIsEnabled = null;
      });
    }else{
      this.alertProvider.showErrorMessage('places/none');
    }
  }
}
