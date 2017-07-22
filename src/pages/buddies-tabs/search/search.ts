import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserProvider, NotificationsProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';



@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {


  public users:FirebaseListObservable<any[]>;
  public currentUser;
  public userData;

  public limit: BehaviorSubject<number> = new BehaviorSubject<number>(10); // import 'rxjs/BehaviorSubject';
  public lastKey: string;
  public queryable: boolean = true;
  public scrollEvent = null;
  private friendSelected = null;
  public loadedUsers: Array<any>;
  public usersList:Array<any>;
  public is_searching = false;

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
    console.log('ionViewDidLoad BuddiesPage');
    this.getAllUsers();
    this.getLastUser();
    //this.setLimit();
  }

  ionViewDidEnter() {
    this.getCurrentUser();
  }

  onCancel(searchbar) {
    console.log(searchbar);
    this.is_searching = false;
  }
  searchUsers(searchbar) {
    console.log(searchbar);
    // Reset items back to all of the items
    //this.initializeItems();
    this.initializeUsers();
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;


    // if the value is an empty string don't filter the items
    if (!q) {
      this.is_searching = false;
      return;
    }
    this.is_searching = true;

    this.usersList = this.usersList.filter((v) => {
      if(v.settings.displayName && q) {
        if (v.settings.displayName.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });

    console.log('compare lengths', this.limit.getValue(), this.usersList.length );

    this.checkListend();

    console.log(q, this.usersList.length);

  }



  scrolled(infiniteScroll) {
    this.scrollEvent = infiniteScroll;

    this.checkListend();
    console.log('this.queryable', this.queryable);
    if (this.queryable) {
      this.limit.next( this.limit.getValue() + 10);
    }
  }

  checkListend(){
    if ( this.limit.getValue() >= this.usersList.length ) {
      this.queryable = false;
      console.log('this.queryable false', this.queryable);
    } else {
      console.log('this.queryable true', this.queryable);
      this.queryable = true;
    }
    if(this.scrollEvent){
      console.log('if this.scrollEvent');
      this.scrollEvent.complete();
      this.scrollEvent.enable(this.queryable);
    }

  }

  initializeUsers(){
    this.usersList = this.loadedUsers;
  }

  getAllUsers() {
    console.log(this.limit);
    this.users = this.afdb.list('/users', {
      query: {
        orderByChild: 'settings/displayName',
        //limitToFirst: this.limit
      }
    });

    this.users.subscribe((users) => {
      if(users){
        this.usersList = users;
        this.loadedUsers = users;
      }
    })
  }

  getCurrentUser() {
    console.log('getCurrentUser');
    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      return;
    }

    this.navParams.data.subscribe(
      values => {
        if(values){
          let key = Object.keys(values)[0];
          for (let key in values) {
            this[key] = values[key];
          }
        }
      },
      error => console.log('error'),
      () => { }
    );
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


  setLimit(){
    this.users.subscribe( (data) => {
      this.loadedUsers = data;

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


  sendFriendRequest(key, oneSignalId, name){
    //this.friendSelected = this.afdb.object(`/users/${key}`);
    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid,
        pending: true,
      },
      displayName: name
    };
    console.log(data);


    this.notifications.sendMessage([oneSignalId], data)
      .then((res) => {
        this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);
      })
      .catch((err) => {
        if(err == 'cordova_not_available'){
          this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);
        }
      })

  }






}
