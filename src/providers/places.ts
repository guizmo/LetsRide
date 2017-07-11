import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { UserProvider} from '../providers';
/*
  Generated class for the PlacesProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class PlacesProvider {

  places: FirebaseListObservable<any[]>;

  constructor(
    public db: AngularFireDatabase,
    public userProvider: UserProvider,
  ) {
    this.places = this.db.list('/places', {
        query: {
          orderByChild: 'name'
        }
      });

    console.log(this)
  }




  getAll(){
    return this.places
      .map(res => res)
      .catch(this.handleError);
  }

  getAllByUser(uid:string){
    return this.db.list('/places', {
        query: {
          orderByChild: 'userId',
          equalTo: uid
        }
      })
      .map(res => res)
      .catch(this.handleError);
  }


  add(item: any) {
    this.places.push(item);
  }
  update(key: string, props: any) {
    this.places.update(key, props)
      .then(res => console.log(res))
  }
  delete(key: string) {
    this.places.remove(key);
  }
  deleteEverything() {
    this.places.remove();
  }
  handleError(error) {
      console.error(error);
      return Observable.throw(error.json().error || 'Server error');
  }

}
