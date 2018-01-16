import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

@Injectable()
export class BuddiesProvider {

  public buddiesIdRef:AngularFireList<any[]>;
  public buddiesId:Observable<any[]>;
  public buddies = new BehaviorSubject<any>([]) ;
  public buddiesRequest = new BehaviorSubject<any>([]) ;
  public buddiesEvents = new BehaviorSubject<any>([]) ;
  public eventsParticipantsList: Array<any> = [];
  public eventsParticipationsRef:AngularFireObject<any>;
  public eventsParticipations:Observable<any>;

  constructor(
    public afdb: AngularFireDatabase,
  ) {
  }

  setBuddiesList(uid:string){
    console.log('setBuddiesList', uid);
    this.buddiesIdRef = this.afdb.list(`/users/${uid}/buddies`)
    this.buddiesId = this.buddiesIdRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  getBuddies(uid:string){
    console.log('getBuddies in provider', uid);
    if(!this.buddiesId){
      //console.log('if !this.buddiesId getBuddies');
      this.setBuddiesList(uid);
    }

    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          let alreadyBuddiesRequest = [];
          let eventsBuddiesRequest = [];
          let futureBuddiesRequest = [];
          for(let _buddy of _buddies){
            if(!_buddy.pending){
              alreadyBuddiesRequest.push( this.afdb.object(`/users/${_buddy.key}`).snapshotChanges().first() );
              eventsBuddiesRequest.push( this.afdb.object(`/events/${_buddy.key}`).snapshotChanges().first() );
            }else{
              futureBuddiesRequest.push( this.afdb.object(`/users/${_buddy.key}`).snapshotChanges().first() );
            }
          }

          if(alreadyBuddiesRequest.length > 0){
            Observable.forkJoin(alreadyBuddiesRequest).subscribe((res) => {
              if(res){
                res = res.filter((_bud:any) => _bud.key ).map((_bud:any) => _bud.payload.val() );
                this.buddies.next(res);
              }
            });
          }else{
            this.buddies.next([]);
          }

          if(futureBuddiesRequest.length > 0){
            Observable.forkJoin(futureBuddiesRequest).subscribe((res) => {
              if(res){
                res = res.filter((_bud:any) => _bud.key ).map((_bud:any) => _bud.payload.val() );
                this.buddiesRequest.next(res);
              }
            });
          }else{
            this.buddiesRequest.next([]);
          }

          if(eventsBuddiesRequest.length > 0){
            Observable.forkJoin(eventsBuddiesRequest).subscribe((res) => {
              if(res){
                //res = res.map((_bud:any) => ({ aFuid: _bud.payload.key, ..._bud.payload.val() }));
                let events = {};
                res.filter((_bud:any) => _bud.key ).map((_bud:any) => {
                  if(_bud.payload){
                    events[_bud.key] = _bud.payload.val() ;
                  }
                });
                this.buddiesEvents.next(events);
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

  refreshBuddiesEvents(buddy_id){
    return this.afdb.object(`/events/${buddy_id}`).valueChanges();
  }

  getBuddiesEvents(buddies){
    let buddiesEventRequest = [];
    for(let buddy of buddies){
      buddiesEventRequest.push( this.afdb.object(`/events/${buddy.aFuid}`).snapshotChanges().first() );
    }
    Observable.forkJoin(buddiesEventRequest).subscribe((res) => {
      if(res){
        let events = {};
        res.map((ev:any) => {
          if(ev.payload){
            events[ev.key] = ev.payload.val() ;
          }
        })
        this.buddiesEvents.next(events);
      }
    });
  }

  /*getBuddiesEvents(uid:string){

    if(!this.buddiesId){
      //console.log('if !this.buddiesId getBuddiesEvents');
      this.setBuddiesList(uid);
    }

    this.buddiesId.subscribe(
      _buddies => {
        if(_buddies){
          let buddiesRequest = [];
          for(let _buddy of _buddies){
            buddiesRequest.push( this.afdb.object(`/events/${_buddy.key}`).snapshotChanges().first() );
          }
          Observable.forkJoin(buddiesRequest).subscribe((res) => {
            if(res){
              let events = {};
              res.map(ev => {
                let event = {};
                events[ev.payload.key] = ev.payload.val() ;
              })
              this.buddiesEvents.next(events);
            }
          });
        }
      },
      error => console.log('error'),
      () => console.log('finished')
    );
  }*/


  getParticipantsID(uid: string, eventID: string){
    //this.eventsParticipations = this.afdb.list(`/events_participation`);
    this.eventsParticipationsRef = this.afdb.object(`/events/${uid}/${eventID}/participants`);
    this.eventsParticipations = this.eventsParticipationsRef.snapshotChanges();
    return this.eventsParticipations;
  }

  updateParticipants(participant: any): Promise<void> {
    //this.eventsParticipations.set(eventID: 'participants', participantID);
    return this.eventsParticipationsRef.update(participant);
  }

  getParticipant(uid: string){
    return this.afdb.object(`/users/${uid}`).valueChanges();
  }

}
