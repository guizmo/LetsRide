import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams }from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CloudFunctionsProvider {
  private functionUrl = 'https://us-central1-lets-ride-a073c.cloudfunctions.net/';

  constructor(public http: Http) {
    console.log('CloudFunctionsProvider Provider');
  }

  deleteOldTrackers(){
    let headers = new Headers({'Access-Control-Allow-Origin': '*' });
    //let params: URLSearchParams = new URLSearchParams();
    return this.http.post(this.functionUrl + 'deleteOldTrackers', {}, headers)
      .toPromise()
      .then( res => console.log(res) );
  }

}
