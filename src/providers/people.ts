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

  getPeople(start, end): FirebaseListObservable<any> {
    return this.afdb.list('/users', {
      query: {
        orderByChild: 'settings/displayName',
        limitToFirst: 10,
        startAt: start,
        endAt: end
      }
    });
  }


}
