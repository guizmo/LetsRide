import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
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
  @ViewChild('searchInput') searchInput:any;
  @ViewChild('searchContent') content:Content;

  public users:FirebaseListObservable<any[]>;
  public currentUser;
  public userData;
  public showSearchbar: boolean = false;

  public limit: BehaviorSubject<number> = new BehaviorSubject<number>(10); // import 'rxjs/BehaviorSubject';
  public lastKey: string;
  public queryable: boolean = true;
  public scrollEvent = null;
  private friendSelected = null;
  public loadedUsers: Array<any>=[];
  public usersList:Array<any>=[] ;
  public is_searching = new BehaviorSubject<boolean>(false);


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
    this.getAllUsers();
    this.getLastUser();
    //this.setLimit();
  }

  ionViewDidEnter() {
    this.getCurrentUser();
  }

  toggleSearchbar() {
    this.showSearchbar = !this.showSearchbar;
    // if(!this.showSearchbar){
    //   this.resetScrollEvent();
    // }
    this.content.resize();
  }

  onCancel(searchbar) {
    //console.log('onCancel');
    //this.is_searching = false;
    this.resetScrollEvent();
  }


  searchUsers(searchbar) {

    // Reset items back to all of the items
    //this.initializeItems();
    this.initializeUsers();
    // set q to the value of the searchbar
    var q = (searchbar.srcElement != null ) ? searchbar.srcElement.value : searchbar;


    // if the value is an empty string don't filter the items
    if (!q) {
      //this.is_searching = false;
      this.resetScrollEvent();
      return;
    }
    //this.is_searching = true;
    this.is_searching.next(true);

    this.usersList = this.usersList.filter((v) => {
      if(v.settings.displayName && q) {
        if (v.settings.displayName.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });


    this.checkListend();

    //console.log(q, this.usersList.length);

  }


  resetScrollEvent(){
    this.is_searching.next(false);
    this.content.scrollToTop(0);
    this.limit.next(10);
    if(this.scrollEvent){
      this.scrollEvent.enable(true);
    }
  }

  scrolled(infiniteScroll) {
    this.scrollEvent = infiniteScroll;

    this.checkListend();
    if (this.queryable) {
      this.limit.next( this.limit.getValue() + 10);
    }
  }

  checkListend(){
    if ( this.limit.getValue() >= this.usersList.length ) {
      this.queryable = false;
    } else {
      this.queryable = true;
    }
    if(this.scrollEvent){
      this.scrollEvent.complete();
      this.scrollEvent.enable(this.queryable);
    }
  }

  initializeUsers(){
    this.usersList = this.loadedUsers;
  }

  getAllUsers() {
    //console.log('this.limit', this.limit);
    this.users = this.afdb.list('/users', {
      query: {
        orderByChild: 'settings/displayName',
        //limitToFirst: this.limit
      }
    });

    this.users.subscribe((users) => {
      if(users){
        users.map((_user) => {
          _user.sortByName = _user.settings.displayName;

          if(_user.profileImg && _user.profileImg.url != ''){
            _user.avatar = _user.profileImg.url;
          }else if(_user.photoURL){
            _user.avatar = _user.photoURL;
          }else{
            _user.avatar = './assets/img/man.svg';
          }

        });
        this.usersList = users;
        this.loadedUsers = users;
        if(this.is_searching.getValue()){
          this.searchUsers(this.searchInput.value);
        }
      }
    })
  }

  getCurrentUser() {
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
      if (data.length > 0) {
        this.lastKey = data[0].$key;
      } else {
        this.lastKey = '';
      }
    });
  }

  sendFriendRequest(key, oneSignalId, name){

    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid,
        pending: true,
      },
      displayName: name
    };
    //console.log(data);


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
