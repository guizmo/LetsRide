import { Injectable } from '@angular/core';
import { DISCIPLINES } from '../data/disciplines';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DisciplinesProvider {

    findAll() {
        return Observable.create(observer => {
            observer.next(DISCIPLINES);
            observer.complete();
        });
    }

    findById(id) {
        return Observable.create(observer => {
            observer.next(DISCIPLINES[id - 1]);
            observer.complete();
        });
    }

}