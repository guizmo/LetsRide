import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Translate } from './translate';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Dialogs } from '@ionic-native/dialogs';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

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

  constructor(
    public http: Http,
    public translate: Translate,
    private afAuth: AngularFireAuth,
    private dialogs: Dialogs,
    private fb: Facebook,
    private platform: Platform,
    private spinnerDialog: SpinnerDialog
  ) {
      afAuth.authState.subscribe((user: firebase.User) => {
        this.currentUser = user;
      });
      console.log(this)

  }

  get authenticated(): boolean {
    return this.currentUser !== null;
  }

  signInUser(newEmail: string, newPassword: string): firebase.Promise<any> {
    this.spinnerDialog.show(null,'Loading',true,{overlayOpacity:0.60});

    let signIn = this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
    console.log('firebaseUser login');
    signIn.then( (firebaseUser) => {
      console.log('firebaseUser', firebaseUser);
      this.spinnerDialog.hide();
    }).catch( (error) => {
      console.error('ERROR', error);
      this.spinnerDialog.hide();
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
    let signInFB = null;
    if (this.platform.is('cordova')) {
      signInFB = this.fb.login(['email', 'public_profile'])

      signInFB.then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredential);
      })
    }else{
      signInFB = this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

      signInFB.then(firebaseUser => {
        console.log('signInWithFacebook' , firebaseUser)
      }).catch( (error) => {
        console.error('ERROR', error);
      })

    }

    return signInFB;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    let alertTitle = this.translate.getString('SIGNOUT_TITLE') || 'Sign out';
    let btn1 = this.translate.getString('YES') || 'Yes';
    let btn2 = this.translate.getString('NO') || 'No';
    let alertMsg = this.translate.getString('SIGNOUT_MSG') || 'Do you really want to logout';

    this.dialogs.confirm(
      alertMsg,
      alertTitle,
      [btn1,btn2]
    )
    .then((res) => {
      if(res === 1)
        this.afAuth.auth.signOut();
    })
    .catch(e => console.log('Error displaying dialog', e));

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
