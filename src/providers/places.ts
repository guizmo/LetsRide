import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { TranslateService } from '@ngx-translate/core';

import { UserProvider} from '../providers';

@Injectable()
export class PlacesProvider {

  placesRef: AngularFireList<any[]>;
  places: Observable<any[]>;
  private countries: ReadonlyArray<any>;

  constructor(
    public db: AngularFireDatabase,
    public userProvider: UserProvider,
    public translateService: TranslateService,
  ) {
    this.translateService.get(['COUNTRIES']).subscribe((values) => {
      this.countries = values.COUNTRIES;
    });
    this.placesRef = this.db.list('/places', ref => ref.orderByChild('name') );
    this.places = this.placesRef.snapshotChanges()
  }

  getById(key:string){
    return this.db.object(`/places/${key}`).valueChanges()
      .catch(this.handleError);
  }

  getAll(){
    return this.places.map(changes => {
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
    return this.placesRef.push(item);
  }
  update(key: string, props: any) {
    this.placesRef.update(key, props)
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
  getCountry(code = ''){
    let filteredList;
    let countryName;
    if(code != ''){
      filteredList = this.countries.filter(country => code == country.code);
      countryName = filteredList.length ? filteredList[0].name : code;
    }
    return countryName;
  }

}
