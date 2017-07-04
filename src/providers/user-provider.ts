import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Platform, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Facebook } from '@ionic-native/facebook';

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from "rxjs/Rx";


import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import {Profile} from '../models/profile';
import { Translate } from './translate';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';


@Injectable()
export class UserProvider {

  currentUser: firebase.User;
  currentProfile = new BehaviorSubject<Profile>(null);
  localUser: any;
  emailVerified: boolean = false;
  checkVerified;

  constructor(
    public http: Http,
    public translate: Translate,
    private afAuth: AngularFireAuth,
    private fb: Facebook,
    private platform: Platform,
    public afDB: AngularFireDatabase,
    public storage: Storage,
    public alertProvider: AlertProvider,
    public loadingProvider: LoadingProvider,
    public events: Events
  ) {

    afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.currentUser = _user;
        let providerData = {..._user.providerData[0], ...{'aFuid':_user.uid} };
        this.emailVerified = this.currentUser.emailVerified;
        this.currentProfile.next( Object.assign(providerData) );
        this.setLocalUser(providerData);
        console.log('afAuth.authState Observable in')
      } else {
        console.log('afAuth.authState Observable out')
        this.currentProfile.next(null);
      }

    });

  }
  getUser(): Observable<firebase.User> {
    return Observable.create(observer => {
      this.afAuth.authState.subscribe((_user: firebase.User) => {
        if (_user) {
          let providerData = {..._user.providerData[0], ...{'aFuid':_user.uid} }
          observer.next( Object.assign(_user) );
          this.currentProfile.next( Object.assign(providerData) );
          observer.complete();
        } else {
          observer.next(null);
          this.currentProfile.next(null);
        }

      });
    });

  }

  //TEST
  getProfile(): Observable<Profile> {
    return Observable.create(observer => {
      this.afAuth.authState.subscribe((_user: firebase.User) => {
        if (_user) {
          this.currentUser = _user;
          let providerData = {..._user.providerData[0], ...{'aFuid':_user.uid} };
          this.currentProfile.next( Object.assign(providerData) );
          //this.currentProfile.complete();
          observer.next( Object.assign(providerData) );
          observer.complete();
          console.log('Observable getProfile in')
        } else {
          console.log('Observable getProfile out')
          observer.next(null);
        }

      });
    });
  }

  isVerifiedEmail() {
    // Return the observable. DO NOT subscribe here.
    //return this.afAuth.authState;
    return Observable.create(observer => {
        observer.next(this.emailVerified);
        observer.complete();
    });
    // Hint: you could also transform the value before returning it:
    // return this.af.auth.map(authData => new User({name: authData.name}));
  }

  signInUser(email: string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }


  signUpUser(name: string, newEmail: string, newPassword: string): firebase.Promise<any> {
    let infos = {name, newEmail};
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword)
      .then((newUser) => {

        newUser.sendEmailVerification().then(
          (success) => {
            console.log("please verify your email")
          }
        ).catch(
          (err) => {
            //this.error = err;
            console.log('error', err)
          }
        )

        this.updateProfile(newUser, infos);
        return newUser;
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

      return signInFB.then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return this.afAuth.auth.signInWithCredential(facebookCredential).then(user => {
          console.log('firebaseUser', JSON.stringify(user))

          this.profileExist(user.uid).then((data) => {
            if(!data){
              this.setLocalProfiles({'displayName': user.displayName}, user.uid)
            }
          });
          return user;
        }).catch( (error) => console.error('ERROR', error))
      })

    }else{
      signInFB = this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

      return signInFB.then(firebaseUser => {
        let user = firebaseUser.user;

        this.profileExist(user.uid).then((data) => {
          if(!data){
            this.setLocalProfiles({'displayName': user.displayName}, user.uid)
          }
        });

        return user;

      }).catch( (error) => console.error('ERROR', error))
    }

  }


  profileExist(aFuid){
    return this.storage.get('profiles').then((data) => {
      if(!data || !data[aFuid] ){
        console.log('new firebaseUser', aFuid)
        return false;
      }else{
        console.log('already a firebaseUser', aFuid)
        return true;
      }
    });
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

  setLocalUser(user){
    this.storage.set('user', user);
  }

  getLocalUser(){
    this.storage.get('user').then((data) => {
      this.localUser = data;
    });
  }

  setLocalProfiles(profile, id = null ){
    return this.storage.get('profiles').then((data) => {
      if(!data){
        data = {};
      }
      data[id] = profile;
      this.storage.set('profiles', data);
      return data;
    });
  }


  updatePassword(currentPassword, password){
    this.loadingProvider.show();
    let credential = firebase.auth.EmailAuthProvider.credential(this.currentUser.email, currentPassword);

    firebase.auth().currentUser.reauthenticateWithCredential(credential)
      .then(() => {
        //success

        //UPDATE PASSWORD ON FIREBASE
        firebase.auth().currentUser.updatePassword(password)
          .then(() => {
            //success
            this.afAuth.auth.signOut()
              .then(() => {
                this.signInUser(this.currentUser.email, password)
                  .then((success) => {
                    this.loadingProvider.hide();
                    this.alertProvider.showPasswordChangedMessage();
                  })
              })
          })
          .catch((error) => {
            //show error
            this.loadingProvider.hide();
            let code = error["code"];
            this.alertProvider.showErrorMessage(code);
            console.error(error)
          });

      })
      .catch((error) => {
        //show error
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
        console.error( error)
      })
  }




  updateEmail(email){
    this.loadingProvider.show();

    //UPDATE EMAIL ON FIREBASE
    return this.afAuth.auth.currentUser.updateEmail(email)
      .then((user) => {
        // Check if emailVerification
        this.loadingProvider.hide();
        return this.sendEmailVerification().then(() => {
          return this.afAuth.auth.currentUser;
        }).catch((error) => {
          //this.error = err;
          console.error(error)
          throw error;
        })
      })
      .catch((error) => {
        //show error
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
        console.error(error)
        if (code == 'auth/requires-recent-login') {
          this.afAuth.auth.signOut();
        }
        throw error;
      });

  }



  sendEmailVerification(){
    return this.afAuth.auth.currentUser.sendEmailVerification().then(() => {
      this.alertProvider.showEmailVerificationSentMessage(this.afAuth.auth.currentUser.email);
      return this.checkEmailIsVerified().then((data) => {
        this.alertProvider.showEmailVerifiedMessage();
        return data;
      })
      //return this.afAuth.auth.currentUser;
    }).catch((error) => {
      //this.error = err;
      console.error(error)
      throw error;
    })
  }

  checkEmailIsVerified(): Promise<boolean>{
    var that = this;
    return new Promise<boolean>((resolve, reject) => {
      that.checkVerified = setInterval(function() {
        that.currentUser.reload();
        if (that.currentUser.emailVerified) {
          clearInterval(that.checkVerified);
          that.emailVerified = true;
          resolve(true);
        }
      }, 1000);
    });
  }




}
