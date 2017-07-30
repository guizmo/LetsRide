import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class BuddiesProvider {

  public buddiesId:FirebaseListObservable<any[]>;
  public buddies = new BehaviorSubject<any>([]) ;
  public buddiesEvents = new BehaviorSubject<any>([]) ;

  constructor(
    public afdb: AngularFireDatabase,
  ) {
    console.log('Hello BuddiesProvider Provider');
  }

  setBuddiesList(uid:string){
    this.buddiesId = this.afdb.list(`/users/${uid}/buddies`,{
      query: {
        orderByChild: 'pending',
        equalTo: false
      }
    });
  }

  getBuddies(uid:string){
    if(!this.buddiesId){
      this.setBuddiesList(uid);
    }

    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          console.log('buddies list changed');
          let buddiesRequest = [];
          for(let _buddy of _buddies){
            buddiesRequest.push( this.afdb.object(`/users/${_buddy.$key}`).first() );
          }

          Observable.forkJoin(buddiesRequest).subscribe((res) => {
            if(res){
              this.buddies.next(res);
            }
          });
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );

  }



  getBuddiesEvents(uid:string){
    if(!this.buddiesId){
      this.setBuddiesList(uid);
    }

    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          console.log('buddies list changed');
          let buddiesRequest = [];
          for(let _buddy of _buddies){
            buddiesRequest.push( this.afdb.object(`/events/${_buddy.$key}`).first() );
          }

          Observable.forkJoin(buddiesRequest).subscribe((res) => {
            if(res){
              this.buddiesEvents.next(res);
            }
          });
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );


  }

}
