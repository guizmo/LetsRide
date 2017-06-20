import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Events } from 'ionic-angular';

/*
  Generated class for the AppEvents provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class AppEvents {

  constructor(public http: Http, public events: Events) {
    this.listenLogout();
  }

  listenLogout(){
    this.events.subscribe('user:logout', () => {
      console.log('user:logout event');
    });
  }



}
