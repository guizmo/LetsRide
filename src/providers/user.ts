import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Translate } from './translate';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
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

  public currentUser: firebase.User;

  constructor(
    public http: Http,
    public translate: Translate,
    private afAuth: AngularFireAuth,
    private fb: Facebook,
    private platform: Platform,
    public afDB: AngularFireDatabase
  ) {
      afAuth.authState.subscribe((user: firebase.User) => {
        this.currentUser = user;
      });
  }

  get authenticated(): boolean {
    return this.currentUser !== null;
  }

  signInUser(newEmail: string, newPassword: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }

  signUpUser(name: string, newEmail: string, newPassword: string): firebase.Promise<any> {
    let infos = {name, newEmail};
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword).then((newUser) => {
        this.updateProfile(newUser, infos);
        //this.storeProfileDatabase(newUser, infos);
      });

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
      }).catch( (error) => console.error('ERROR', error))
    }
    return signInFB;
  }

  updateProfile(user, infos){
    user.updateProfile({
      displayName: infos.name
    }).then(() => {
      // Update successful
    });
  }

  storeProfileDatabase(user, infos){
    this.afDB.database.ref('/userProfile').child(user.uid).set({
      firstName: infos.name,
      email: infos.newEmail
    });
  }
  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this.afAuth.auth.signOut()
  }

}
