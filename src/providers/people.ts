import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class PeopleProvider {

  public people:Observable<any[]>;
  public buddies = new BehaviorSubject<any>([]) ;

  constructor(
    public afdb: AngularFireDatabase,
  ) {
  }

  getPeople(start = null, end = null, limitToFirst = null): Observable<any> {
    /*let query:any = {
      orderByChild : 'settings/displayName'
    };*/
    /*query: {
      orderByChild: 'settings/displayName',
      limitToFirst: 10,
      startAt: start,
      endAt: end
    }*/

    //return this.afdb.list('/users', { query: query })
    //TODO: https://github.com/angular/angularfire2/blob/master/docs/rtdb/querying-lists.md
    //Dynamic querying
    //return ref.orderByChild('settings/displayName').startAt(start).endAt(end).limitToFirst(limitToFirst)

    return this.afdb.list('/users',
      ref => {
        let newRef = ref.orderByChild('settings/displayName');

        if(start){
          newRef = newRef.startAt(start);
        }
        if(end){
          newRef = newRef.endAt(end);
        }
        if(limitToFirst){
          newRef = newRef.limitToFirst(limitToFirst);
        }
        return newRef;
      }
    ).valueChanges();
  }



}
