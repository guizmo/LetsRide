import { Injectable } from '@angular/core';
import { DISCIPLINES } from './mock-disciplines';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DisciplinesService {

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
