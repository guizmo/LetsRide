import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class BuddiesProvider {

  public buddiesId:FirebaseListObservable<any[]>;
  public buddies = new BehaviorSubject<any>([]) ;
  public buddiesRequest = new BehaviorSubject<any>([]) ;
  public buddiesEvents = new BehaviorSubject<any>([]) ;

  constructor(
    public afdb: AngularFireDatabase,
  ) {
  }

  setBuddiesList(uid:string){
    this.buddiesId = this.afdb.list(`/users/${uid}/buddies`);
      /*,{
      query: {
        orderByChild: 'pending',
        equalTo: false
      }
    });*/
  }

  getBuddies(uid:string){
    //console.log('getBuddies in provider');
    if(!this.buddiesId){
      //console.log('if !this.buddiesId getBuddies');
      this.setBuddiesList(uid);
    }

    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          //console.log('buddies list changed');
          let alreadyBuddiesRequest = [];
          let eventsBuddiesRequest = [];
          let futureBuddiesRequest = [];
          for(let _buddy of _buddies){
            if(!_buddy.pending){
              alreadyBuddiesRequest.push( this.afdb.object(`/users/${_buddy.$key}`).first() );
              eventsBuddiesRequest.push( this.afdb.object(`/events/${_buddy.$key}`).first() );
            }else{
              futureBuddiesRequest.push( this.afdb.object(`/users/${_buddy.$key}`).first() );
            }
          }

          if(alreadyBuddiesRequest.length > 0){
            Observable.forkJoin(alreadyBuddiesRequest).subscribe((res) => {
              if(res){
                this.buddies.next(res);
              }
            });
          }else{
            this.buddies.next([]);
          }

          if(futureBuddiesRequest.length > 0){
            Observable.forkJoin(futureBuddiesRequest).subscribe((res) => {
              if(res){
                this.buddiesRequest.next(res);
              }
            });
          }else{
            this.buddiesRequest.next([]);
          }

          if(eventsBuddiesRequest.length > 0){
            Observable.forkJoin(eventsBuddiesRequest).subscribe((res) => {
              if(res){
                this.buddiesEvents.next(res);
              }
            });
          }else{
            this.buddiesEvents.next([]);
          }
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );

  }



  getBuddiesEvents(uid:string){
    if(!this.buddiesId){
      //console.log('if !this.buddiesId getBuddiesEvents');
      this.setBuddiesList(uid);
    }

    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          //console.log('buddies list changed');
          let buddiesRequest = [];
          for(let _buddy of _buddies){
            buddiesRequest.push( this.afdb.object(`/events/${_buddy.$key}`).first() );
          }
          console.log('buddiesRequest', buddiesRequest);
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
