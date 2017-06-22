import { Injectable } from '@angular/core';
import { COUNTRIES } from '../data/countries';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CountriesProvider {

    findAll() {
        return Observable.create(observer => {
            observer.next(COUNTRIES);
            observer.complete();
        });
    }

    findById(id) {
        return Observable.create(observer => {
            observer.next(COUNTRIES[id - 1]);
            observer.complete();
        });
    }

}
