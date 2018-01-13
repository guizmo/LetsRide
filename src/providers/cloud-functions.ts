import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders }from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

/*const httpOptions = {
    headers: new HttpHeaders({'Access-Control-Allow-Origin': '*' })
};*/

@Injectable()
export class CloudFunctionsProvider {
  //private functionUrl = 'https://us-central1-lets-ride-a073c.cloudfunctions.net/';

  constructor(public http: HttpClient) {
  }

  deleteOldTrackers(){
    //let headers = new HttpHeaders({'Access-Control-Allow-Origin': '*' });
    //let params: HttpParams = new HttpParams();
    //TODO: BUG
    /*return this.http.post(this.functionUrl + 'deleteOldTrackers', {}, httpOptions)
      .toPromise()
      .then( res => console.log(res) );
    */
  }

}
