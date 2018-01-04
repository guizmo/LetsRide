import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

import { UserProvider} from '../providers';

@Injectable()
export class PlacesProvider {

  placesRef: AngularFireList<any[]>;
  places: Observable<any[]>;

  constructor(
    public db: AngularFireDatabase,
    public userProvider: UserProvider,
  ) {
    this.placesRef = this.db.list('/places', ref => ref.orderByChild('name') );
    this.places = this.placesRef.snapshotChanges()
  }

  getAll(){
    return this.places
      .map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      })
      .catch(this.handleError);
  }

  getAllByUser(uid:string){
    return this.db.list('/places', ref => ref.orderByChild('userId').equalTo(uid))
      .snapshotChanges()
      .map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      })
      .catch(this.handleError);

  }


  add(item: any) {
    this.placesRef.push(item);
  }
  update(key: string, props: any) {
    this.placesRef.update(key, props)
      .then(res => console.log(res))
  }
  delete(key: string) {
    this.placesRef.remove(key);
  }
  deleteEverything() {
    this.placesRef.remove();
  }
  handleError(error) {
      console.error(error);
      return Observable.throw(error.json().error || 'Server error');
  }

}
