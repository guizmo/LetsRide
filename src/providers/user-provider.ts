import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Platform, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from "rxjs/Rx";


import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {Profile} from '../models/profile';
import { Translate } from './translate';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';


@Injectable()
export class UserProvider {

  currentUser: firebase.User;
  localUser: any;
  emailVerified: boolean = false;
  checkVerified;

  constructor(
    public http: Http,
    public translate: Translate,
    public afAuth: AngularFireAuth,
    private fb: Facebook,
    private googlePlus: GooglePlus,
    private platform: Platform,
    private storage: Storage,
    public alertProvider: AlertProvider,
    public loadingProvider: LoadingProvider,
  ) {
    afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.currentUser = _user;
        let providerData = {..._user.providerData[0], ...{'aFuid':_user.uid} };
        this.emailVerified = this.currentUser.emailVerified;
        this.setLocalUser(providerData);
        console.log('afAuth.authState Observable in')
      } else {
        console.log('afAuth.authState Observable out')
      }

    });

  }



  //OK
  signInUser(email: string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  //OK
  signUpUser(name: string, newEmail: string, newPassword: string): firebase.Promise<any> {
    let infos = {name, newEmail};
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword)
      .then((newUser) => {

        newUser.sendEmailVerification()
          .then((success) => {
            console.log("please verify your email")
          }).catch(
          (error) => {
            //this.error = err;
            console.error(error);
            throw error;
          });

        return newUser.updateProfile({
            displayName: infos.name
          }).then(() => {
            return newUser;
          }).catch((error) => {
            console.error(error);
            throw error;
          });

      });

  }

  //OK
  resetPassword(email: string): firebase.Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }


  //OK
  signInWithProvider(provider:string): firebase.Promise<any> {
    let sdkProvider;
    let webProvider;
    const providers = {
      gp : 'Google+',
      fb : 'Facebook'
    }

    if(provider == providers.gp){
      sdkProvider = this.googlePlus.login({ 'webClientId': '897213692051-lvpeb0c5t59slq2e5uoobrmpa54f5i11.apps.googleusercontent.com', 'offline': true });
      webProvider = this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }else if(provider == providers.fb){
      sdkProvider = this.fb.login(['email', 'public_profile']);
      webProvider = this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    }else{
      throw 'need provider';
    }

    let is_cordova = this.platform.is('cordova');
    let signInGP = (is_cordova) ? sdkProvider : webProvider;

    return signInGP.then(res => {
      if(is_cordova){
        let sdkCredential = (provider == providers.fb) ? firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken) : firebase.auth.GoogleAuthProvider.credential(res.idToken);
        return this.afAuth.auth.signInWithCredential(sdkCredential).then(user => {
          this.setLocalProfiles({'displayName': user.displayName}, user.uid)
          return user;
        }).catch( (error) => {
          console.error('ERROR', error);
          throw error ;
        });
      }else{
        let user = res.user;
        this.setLocalProfiles({'displayName': user.displayName}, user.uid)
        return user;
      }
    }).catch( (error) => {
      console.error('ERROR', error);
      throw error ;
    });

  }


  /**
   * Log the user out, which forgets the session
   */
  //OK
  logout() {
    this.afAuth.auth.signOut()

  }
  //OK
  setLocalUser(user){
    this.storage.set('user', user);
  }
  //OK
  getLocalUser(){
    this.storage.get('user').then((data) => {
      this.localUser = data;
    });
  }

  //OK
  setLocalProfiles(profile, id = null, update = false ){
    return this.storage.get('profiles').then((data) => {
      if(!data){
        data = {};
      }
      if(data[id]){
        if(!update){
          profile.displayName = data[id].displayName;
        }
        Object.assign(data[id], profile);
      }else{
        data[id] = profile;
      }
      this.storage.set('profiles', data);
      return data;
    });
  }

  //OK
  getLocalProfile(aFuid){
    return this.storage.get('profiles').then((data) => {
      if(!data || !data[aFuid] ){
        return null;
      }else{
        return data[aFuid];
      }
    });
  }


  //OK
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



  //OK
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


  //OK
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
  //OK
  checkEmailIsVerified(): Promise<boolean>{
    let that = this;
    return new Promise<boolean>((resolve, reject) => {
      let checkVerified = setInterval(function() {
        console.log('ticking')
        that.currentUser.reload();
        if (that.currentUser.emailVerified) {
          clearInterval(checkVerified);
          //that.emailVerified = true;
          resolve(true);
        }
      }, 1000);
    });
  }

  displayName(): string {
    if (this.currentUser !== null) {
      return this.currentUser.displayName;
    } else {
      return '';
    }
  }



}
