import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

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
    };

    if(start){
      query.startAt = start;
    }
    if(end){
      query.endAt = end;
    }
    if(limitToFirst){
      query.limitToFirst = limitToFirst;
    }*/
    /*query: {
      orderByChild: 'settings/displayName',
      limitToFirst: 10,
      startAt: start,
      endAt: end
    }*/

    //return this.afdb.list('/users', { query: query })
    //TODO: https://github.com/angular/angularfire2/blob/master/docs/rtdb/querying-lists.md
    //Dynamic querying
    return this.afdb.list('/users',
      ref => ref.orderByChild('settings/displayName').startAt(start).endAt(end).limitToFirst(limitToFirst)
    ).snapshotChanges();
  }



}
