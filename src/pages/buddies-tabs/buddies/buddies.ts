import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { UserProvider, BuddiesProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';


@IonicPage()
@Component({
  selector: 'page-buddies',
  templateUrl: 'buddies.html',
})
export class BuddiesPage {

  public currentUser;
  public userData;
  public buddiesId:FirebaseListObservable<any[]>;
  public buddies: any = [] ;
  public buddiesPromise: any = [] ;
  private buddiesSubcription;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    private buddiesProvider: BuddiesProvider,
    private userProvider: UserProvider
  ) {
    console.log(this);
  }
  ionViewDidLeave(){
  }
  ionViewWillUnload(){
    this.buddiesSubcription.unsubscribe();
  }

  ionViewDidLoad() {
    //fFired only when a view is stored in memory. This event is NOT fired on entering a view that is already cached. It’s a nice place for init related tasks.
    this.getCurrentUser();
  }

  ionViewDidEnter() {
  }

  getCurrentUser() {
    //console.log('getCurrentUser');
    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      this.getBuddies(this.currentUser.uid);
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

  getBuddies(uid:string){
    this.buddiesProvider.getBuddies(uid);
    console.log('buddies subscription');
    this.buddiesSubcription = this.buddiesProvider.buddies.subscribe((buddies) => {
      console.log(buddies);
      this.buddies = buddies;
    })
  }


  removeFriend(index){
    let { aFuid, displayName, oneSignalId} = this.buddies[index];

    //remove reference to request in currentUser
    let removeFromCurrentUser = this.afdb.object(`/users/${this.userData.aFuid}/buddies/${aFuid}`).remove();
    //remove reference to request from the ASKER
    let removeFromAsker = this.afdb.object(`/users/${aFuid}/buddies/${this.userData.aFuid}`).remove();

    removeFromCurrentUser
      .then(_ => console.log('success removeFromCurrentUser'))
      .catch(err => console.log(err, 'removeFromCurrentUser error!'));

    removeFromAsker
      .then(_ => console.log('success removeFromAsker'))
      .catch(err => console.log(err, 'removeFromAsker error!'));
  }

}
