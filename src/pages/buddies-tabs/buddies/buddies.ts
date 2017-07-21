import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserProvider, NotificationsProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

/**
 * Generated class for the BuddiesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-buddies',
  templateUrl: 'buddies.html',
})
export class BuddiesPage {

  public users:FirebaseListObservable<any[]>;
  public currentUser;
  public userSettings;

  public limit:BehaviorSubject<number> = new BehaviorSubject<number>(10); // import 'rxjs/BehaviorSubject';
  public lastKey: string;
  public queryable: boolean = true;
  public scrollEvent = null;
  private friendSelected = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public userProvider: UserProvider,
    private notifications: NotificationsProvider
  ) {
    console.log(this);
  }

  ionViewDidLoad() {
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.currentUser = user.toJSON();
        this.userProvider.userData.subscribe((settings) => this.userSettings = settings);
      }
    });
    console.log('ionViewDidLoad BuddiesPage');
    this.getAllUsers();
    this.getLastUser();
    this.setLimit();
  }

  getLastUser() {
    this.afdb.list('/users', {
      query: {
        orderByChild: 'settings/displayName',
        limitToLast: 1
      }
    }).subscribe((data) => {
      // Found the last key
      console.log(data);
      if (data.length > 0) {
        this.lastKey = data[0].$key;
      } else {
        this.lastKey = '';
      }
    });
  }

  getAllUsers() {
    console.log(this.limit);
    this.users = this.afdb.list('/users', {
      query: {
        orderByChild: 'settings/displayName',
        limitToFirst: this.limit
      }
    })
  }

  setLimit(){
    this.users.subscribe( (data) => {
      console.log(data);

      if (data.length > 0) {
        // If the last key in the list equals the last key in the database
        if (data[data.length - 1].$key === this.lastKey) {
          this.queryable = false;
        } else {
          this.queryable = true;
        }
      }
      if(this.scrollEvent){
        this.scrollEvent.complete();
        this.scrollEvent.enable(this.queryable);
      }
    });
  }

  scrolled(infiniteScroll) {
    this.scrollEvent = infiniteScroll;
    console.log('this.queryable', this.queryable);
    if (this.queryable) {
      this.limit.next( this.limit.getValue() + 10);
    }
  }


  sendFriendRequest(key, oneSignalId, name){
    //this.friendSelected = this.afdb.object(`/users/${key}`);
    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: this.userSettings.oneSignalId,
        user_id: this.userSettings.aFuid,
        pending: true,
      },
      displayName: name
    };
    console.log(data);
    this.notifications.sendMessage([oneSignalId], data)
      .then((res) => {
        this.afdb.list(`/users/${key}/buddies`).update(this.userSettings.aFuid, data.from);
      })
      .catch((err) => console.log(err))

  }



}
