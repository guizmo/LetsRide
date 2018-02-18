import { Component, ViewChildren, QueryList } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, PopoverController, ItemSliding, Item } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { TranslateService } from '@ngx-translate/core';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import * as moment  from 'moment';

import { UserProvider, BuddiesProvider, PlacesProvider, NotificationsProvider, UtilsProvider, SearchProvider} from '../../../providers';

//https://forum.ionicframework.com/t/click-to-slide-open-ion-item-sliding-instead-of-swiping/54642/5
//http://blog.ihsanberahim.com/2017/05/trigger-ionitemsliding-using-click-event.html


//https://stackoverflow.com/questions/43185996/subscribe-to-done-event-in-datetime-picker-in-ionic2


@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  @ViewChildren('eventsItem') eventsItem: QueryList<Item>;
  @ViewChildren('eventsSliding') eventsSliding: QueryList<ItemSliding>;

  activeMenu = 'EventsPage';
  popover = null;
  segments = 'events';
  translatedStrings:any = {};
  sportfilter;
  private ngUnsubscribe:Subject<void> = new Subject();
  private places: any = [];
  private placesFullList: any = [];
  private activeItemSliding:boolean = false;
  private userData;
  private currentUser;
  private itemInUpdateMode;
  private refresher;
  private eventModal;
  private mapModal;
  private sportModal;
  public eventsRef: AngularFireList<any>;
  public events: Observable<any[]>;
  public buddiesEvents: any = [];
  public buddies: any = [] ;
  public oneSignalBuddiesId: any = [];
  public eventsListing: any = [];
  private showSpinner:boolean = true;
  private showNoResult:boolean = false;
  private showMapIsEnabled: string = null;
  public disciplines: ReadonlyArray<any>;
  public countries: ReadonlyArray<any>;
  private publicEvents: Array<any> = [];
  private publicEventsSearchResult: Array<any> = [];

  constructor(
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
    private translateService: TranslateService,
    private popoverCtrl: PopoverController,
    private utils: UtilsProvider,
    private searchProvider: SearchProvider
  ) {
    console.log(this);
    moment.locale(this.translateService.currentLang);
    (!this.utils.countries) ? this.utils.getCountries().then(res => this.countries = res) : this.countries = this.utils.countries;
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;

    this.translateService.get(['EVENTS_PAGE', 'CANCEL_BUTTON', 'DELETE_BUTTON']).takeUntil(this.ngUnsubscribe).subscribe((values) => {
      this.translatedStrings = values.EVENTS_PAGE;
      this.translatedStrings.CANCEL_BUTTON = values.CANCEL_BUTTON;
      this.translatedStrings.DELETE_BUTTON = values.DELETE_BUTTON;
    });

    this.afAuth.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();
        this.getBuddiesEvents();
        this.getBuddies();
        this.listPlaces(user.uid);
        this.userProvider.getUserData().takeUntil(this.ngUnsubscribe).subscribe((settings) => {
          if(settings){
            this.userData = settings;
          }
        });
      }
    });

  }

  ionViewDidLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  searchEvents(){
    this.publicEvents = [];
    this.publicEventsSearchResult = [];
    let style = 'default.png';
    this.searchProvider.fetchEvents(this.userData.aFuid).subscribe( (evts) => {
      evts.forEach(event => {
        if(event && event.place_id){
          let place = this.placesFullList.find( p => p.key == event.place_id );
          if(!place.lat){
            return;
          }
          event.place = place;
        }
        if(event.disciplines){
          let discipline = this.utils.getRidingStyle(event.disciplines, this.disciplines);
          event.disciplinesName = discipline.name;
          style = discipline.image;
        }
        event.backgroundImage = `./assets/img/styles/${style}`;
        this.publicEvents.push(event);
      });
    }, null, () => {
      console.log('fetchEvents done');
      //TODO
      //handle loader
    });
  }

  locationFound(results){
    if(results[0]){
      let place = results[0];
      let searchResults = [];
      if (place.geometry === undefined || place.geometry === null) {
        return;
      }
      if(place.types[0] == 'country'){
        let country = place.address_components[0].short_name;
        searchResults = this.publicEvents.filter(res => res.place.country == country);
      }else{
        let placeGeoloc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        searchResults = this.searchProvider.eventNearBy(this.publicEvents, placeGeoloc);
      }
      this.publicEventsSearchResult = searchResults;
    }
  }


  segmentChanged(action){
    if(action.value == 'search'){
      this.searchEvents();
    }
  }


  presentPopover(event) {
    this.popover = this.popoverCtrl.create('EventPage', {
      values: event
    }, {
      cssClass: 'events-popover-content'
    });
    this.popover.present();
    this.popover.onDidDismiss(() => {
      this.navParams.data = null;
      this.popover = null;
    });
  }

  presentEventModal(clickEvent: Event, event:any = null){
    clickEvent.stopPropagation();
    if(event){
      this.itemInUpdateMode = event.key;
    }
    this.eventModal = this.modalCtrl.create('EventsModalPage', { values: event, places: this.places }, { cssClass: 'inset-modal' })
    this.eventModal.present();

    this.onDismiss();
  }

  presentMapModal(event, place){
    if(!event.aFuid) event.displayName = this.userData.displayName;
    this.mapModal = this.modalCtrl.create('ModalNavPage', { state: 'display_place_event',values: place, page: 'MapPage', event });
    this.mapModal.present();
    this.mapModal.onDidDismiss(data => {
      this.showMapIsEnabled = null;
    })
  }

  presentSportModal(discipline = null){
    discipline = 'xc';
    console.log('sport filter', discipline);
    this.sportModal = this.modalCtrl.create('SportsListPage', { values:discipline});
    this.sportModal.present();
    this.sportModal.onDidDismiss(data => {
      console.log('sportModal.onDidDismiss', data);
    })
  }

  getBuddiesEvents(){
    let now = moment();
    this.buddiesProvider.getBuddies(this.currentUser.uid);
    this.buddiesProvider.buddiesEvents.takeUntil(this.ngUnsubscribe).subscribe((events) => {
      let _events = [];
      Object.keys(events).filter((bud_key) => events[bud_key] ).map((bud_key) => {
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
              let discipline = this.utils.getRidingStyle(event.disciplines, this.disciplines);
              event.disciplinesName = discipline.name;
              style = discipline.image;
            }
            event.backgroundImage = `./assets/img/styles/${style}`;
            event.key = key;
            if (eventTime.diff(now) >= 0){
              if(event.participants && event.participants[this.currentUser.uid]){
                event.participates = true;
                _events.push(Object.assign(event, buddyEvent));
              }
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
            let discipline = this.utils.getRidingStyle(event.disciplines, this.disciplines);
            event.disciplinesName = discipline.name;
            style = discipline.image;
          }
          event.backgroundImage = `./assets/img/styles/${style}`;
          return event;
        })
        .filter((event) => {
          let eventTime = moment(event.time);
          return (eventTime.diff(now) >= 0);
        })
    }).takeUntil(this.ngUnsubscribe).subscribe((events) => {
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
        message.contents = {
          en: `Riding "${event.name}" @ ${time}`,
          fr: `Session "${event.name}" @ ${time}`
        };
        let eventKey;
        let type = 'newEvent';


        if(this.itemInUpdateMode){
          eventKey = this.itemInUpdateMode;
          type = 'eventUpdate';
          if(data.create_place){
            let place = {userId:this.currentUser.uid, name: event.where};
            this.addPlace(place, eventKey);
          }else{
            this.updateEvent(eventKey, event);
          }
          message.headings = {
            en: `${name} has updated an event`,
            fr: `${name} a modifié un événement`
          }
          this.sendEventToBuddies(message, eventKey, type);
        }else{
          message.headings = {
            en: `${name} has created an event`,
            fr: `${name} a crée un événement`
          }

          this.addEvent(event).then((res) => {
            this.sendEventToBuddies(message, res.key, type);
            if(data.create_place){
              let place = { userId: this.currentUser.uid, name: event.where };
              this.addPlace(place, res.key);
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

  deleteEvent(clickEvent: Event, key){
    clickEvent.stopPropagation();

    let confirm = this.alertCtrl.create({
      title: this.translatedStrings.ALERT_TITLE,
      message: this.translatedStrings.ALERT_MSG,
      buttons: [
        {
          text: this.translatedStrings.CANCEL_BUTTON
        },
        {
          text: this.translatedStrings.DELETE_BUTTON,
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
    this.buddiesProvider.buddies.takeUntil(this.ngUnsubscribe).subscribe((_buddies) => {
      if(_buddies){
        this.buddies = _buddies;
        this.oneSignalBuddiesId = _buddies.filter(buddie => buddie.oneSignalId).map(buddie => buddie.oneSignalId);
      }
    })
  }

  sendEventToBuddies(message, key, type){
    if(this.oneSignalBuddiesId.length && this.userData.oneSignalId){
      let buddiesId = [];
      this.buddies.map(buddy => buddiesId.push(buddy.aFuid))

      let name = this.userData.settings.displayName;
      let timestamp = moment().unix();
      let data = {
        type: type,
        from: {
          oneSignalId: this.userData.oneSignalId,
          user_id: this.userData.aFuid
        },
        to: {
          user_ids: buddiesId
        },
        event: {
          id: key,
          timestamp: timestamp
        },
        displayName: name
      };

      let contents = {
        'en': message.contents.en,
        'fr': message.contents.fr
      }
      let headings = {
        'en': message.headings.en,
        'fr': message.headings.fr
      }
      this.notifications.sendMessage(this.oneSignalBuddiesId, data, contents, headings);
    }
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

    if(this.navParams.get('notificationID') && this.eventsListing.length){
      let eventId = this.navParams.get('additionalData').event.id;
      let event = this.eventsListing.filter(event => event.key == eventId);
      if(!this.popover && event[0]){
        this.presentPopover(event[0]);
      }
    }
  }

  refreshList(refresher) {
    this.refresher = refresher;
    this.getBuddiesEvents();
  }

  listPlaces(uid:string){
    this.placesProvider.getAll().takeUntil(this.ngUnsubscribe).subscribe((data) => {
      this.placesFullList = data;
      this.places = data.filter(res => res.userId == uid);
    });
  }

  showMap(index, event){
    if(this.showMapIsEnabled === null){
      this.showMapIsEnabled = index;
      event.currentUser = this.currentUser.uid;

      for(let uid in event.participants){
        if(event.participants[uid] === true){
          this.buddiesProvider.getUserByID(uid).takeUntil(this.ngUnsubscribe).subscribe(res => {
            if(res){
              res = this.utils.buildProfile(res, this.disciplines, this.countries);
              this.buddiesProvider.eventsParticipantsList.push(res);
            }
          });
        }
      }
      if(event.place_id){
        this.placesProvider.getById(event.place_id).takeUntil(this.ngUnsubscribe).subscribe(place => {
          place = ( place ) ? place : {};
          this.presentMapModal(event, place);
        });
      }else{
        this.presentMapModal(event, {});
      }
    }

  }

}
