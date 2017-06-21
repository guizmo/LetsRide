import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Translate } from './translate';
//import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from "rxjs/Rx";

import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import {Profile} from '../models/profile';


@Injectable()
export class UserProvider {

  public currentUser: firebase.User;
  //profileUser = new BehaviorSubject<Profile>(null);

  constructor(
    public http: Http,
    public translate: Translate,
    private afAuth: AngularFireAuth,
    private fb: Facebook,
    private platform: Platform,
    public afDB: AngularFireDatabase
  ) {
  }

  getProfile(): Observable<Profile> {
    return Observable.create(observer => {
      this.afAuth.authState.subscribe((_user: firebase.User) => {
        if (_user) {
          this.currentUser = _user;
          let providerData = {..._user.providerData[0], ...{'aFuid':_user.uid} };
          //this.profileUser.next( Object.assign(providerData) );
          observer.next( Object.assign(providerData) );
          observer.complete();
          console.log('Observable in', this)
        } else {
          console.log('Observable out')
          observer.next(null);
        }

      });
    });
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
