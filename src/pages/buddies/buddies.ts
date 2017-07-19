import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserProvider, NotificationsProvider } from '../../providers';
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

  public limit:BehaviorSubject<number> = new BehaviorSubject<number>(10); // import 'rxjs/BehaviorSubject';
  public lastKey: string;
  public queryable: boolean = true;
  public scrollEvent = null;
  private friendSelected = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    public userProvider: UserProvider,
    private notifications: NotificationsProvider
  ) {
    console.log(this);
  }

  ionViewDidLoad() {
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
        console.log(data[data.length - 1].$key);
        console.log(this.lastKey);
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


  sendFrienRequest(key){
    this.friendSelected = this.afdb.object(`/users/${key}`);
    this.friendSelected.subscribe(user => {
      let data = {
        displayName: user.settings.displayName,
        from: user.aFuid,
        friendRequest: true
      }
      console.log(data)
      this.notifications.sendMessage(user.oneSignalId, data);
    });
  }



}
