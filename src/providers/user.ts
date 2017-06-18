import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from './api';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  _user: any;
  public currentUser: firebase.User;

  constructor(public http: Http, public api: Api, private afAuth: AngularFireAuth) {
      afAuth.authState.subscribe((user: firebase.User) => {
        this.currentUser = user;
      });
      console.log(this)

  }

  get authenticated(): boolean {
    return this.currentUser !== null;
  }

  signInUser(newEmail: string, newPassword: string): firebase.Promise<any> {
    let signIn = this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);

    signIn.then( (firebaseUser) => {
      if (firebaseUser) {
        this._loggedIn(firebaseUser);
      }
    }).catch( (error) => {
      console.error('ERROR', error);
    })

    return signIn;
  }

  signUpUser(newEmail: string, newPassword: string): firebase.Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword);
  }

  resetPassword(email: string): firebase.Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }


  signInWithFacebook(): firebase.Promise<any> {
    let signInFB = this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

    signInFB.then(firebaseUser => {
      console.log('signInWithFacebook' , firebaseUser)
      if (firebaseUser) {
        this._loggedIn(firebaseUser);
      }
    }).catch( (error) => {
      console.error('ERROR', error);
    })

    return signInFB;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this.afAuth.auth.signOut();
  }


  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp;
  }


  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  /*login(accountInfo: any) {
    let seq = this.api.post('login', accountInfo).share();

    seq
      .map(res => res.json())
      .subscribe(res => {
        // If the API returned a successful response, mark the user as logged in
        if (res.status == 'success') {
          this._loggedIn(res);
        } else {
        }
      }, err => {
        console.error('ERROR', err);
      });

    return seq;
  }*/


  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
   /*
  signup(accountInfo: any) {
    let seq = this.api.post('signup', accountInfo).share();

    seq
      .map(res => res.json())
      .subscribe(res => {
        // If the API returned a successful response, mark the user as logged in
        if (res.status == 'success') {
          this._loggedIn(res);
        }
      }, err => {
        console.error('ERROR', err);
      });

    return seq;
  }

  */

}
