import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider, NotificationsProvider} from '../../providers';

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
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
    private afAuth:AngularFireAuth,
    private modalCtrl:ModalController
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

  presentEventModal(){
    this.eventModal = this.modalCtrl.create('EventsModalPage', null, { cssClass: 'inset-modal' })
    this.eventModal.present();

    this.onDismiss();
  }

  onDismiss(){
    this.eventModal.onDidDismiss(data => {
      console.log(data);
      //Add or update
      //this.addEvent(data);
      //this.updateEvent(data);
    });
  }

  updateEvent(data){
    this.events.update('myEvent1', data);
  }

  addEvent(data){
    this.events.push({myEvent1:data});
  }

}
