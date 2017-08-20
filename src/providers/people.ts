import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class PeopleProvider {

  public people:FirebaseListObservable<any[]>;
  public buddies = new BehaviorSubject<any>([]) ;

  constructor(
    public afdb: AngularFireDatabase,
  ) {
  }

  getPeople(start = null, end = null, limitToFirst = null): FirebaseListObservable<any> {

    let query:any = {
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
    }
    /*query: {
      orderByChild: 'settings/displayName',
      limitToFirst: 10,
      startAt: start,
      endAt: end
    }*/

    console.log('qeury', query);

    return this.afdb.list('/users', { query: query });
  }



}
