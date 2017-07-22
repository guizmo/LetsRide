import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';

import { UserProvider, NotificationsProvider } from '../../../providers';

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


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    private notifications: NotificationsProvider
  ) {
    console.log(this);
  }

  ionViewDidLoad() {
  }
  ionViewDidEnter() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    console.log('getCurrentUser');
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
    this.buddiesId = this.afdb.list(`/users/${uid}/buddies`,{
      query: {
        orderByChild: 'pending',
        equalTo: false
      }
    });


    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          let buddiesRequest = [];
          for(let _buddy of _buddies){
            buddiesRequest.push( this.afdb.object(`/users/${_buddy.$key}`).first() );
          }
          let buddies = [];
          Observable.forkJoin(buddiesRequest).subscribe((res) => {
            if(res){
              this.buddies = res;
            }
          });
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );

  }
}
