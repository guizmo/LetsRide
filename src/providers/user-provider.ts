import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

import { Observable } from "rxjs/Rx";
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Profile } from '../models/profile';
import { Translate } from './translate';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';
import { NotificationsProvider } from './notifications';

//https://angularfirebase.com/snippets/angularfire2-version-4-authentication-service/
@Injectable()
export class UserProvider {

  currentUser: firebase.User;
  localUser: any;
  emailVerified: boolean = false;
  checkVerified;
  userDataRef: AngularFireObject<any>;
  userData: Observable<any>;

  constructor(
    public translate: Translate,
    public afAuth: AngularFireAuth,
    public afdb: AngularFireDatabase,
    private fb: Facebook,
    private googlePlus: GooglePlus,
    private platform: Platform,
    private storage: Storage,
    public alertProvider: AlertProvider,
    public loadingProvider: LoadingProvider,
    private notifications: NotificationsProvider,
    public events: Events
  ) {
    afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.currentUser = _user;
        this.userDataRef = this.afdb.object(`/users/${_user.uid}`);
        //this.getUserData();
        this.emailVerified = this.currentUser.emailVerified;
        //console.log('afAuth.authState Observable in')
        this.checkOneSignalID();
      } else {
        //console.log('afAuth.authState Observable out')
      }

    });
  }

  checkProviderInfos(user){
    if(user.providerId && user.providerId == 'facebook.com'){
      this.getFacebookProfile(user.uid).then(res => {
        if(res && res.picture.data.url != user.photoURL){
          //update user in database
          user.photoURL = res.picture.data.url;
          this.updateUserData(user);
        }
      }).catch(e => {
        //console.log(e);
      });;
    }

  }

  getFacebookProfile(fb_uid:string){
    return this.fb.api(`/${fb_uid}?fields=name,picture.width(200)`, ['public_profile'])
  }

  getUserData(){
    console.log('getUserData');
    return this.userData = this.userDataRef.snapshotChanges().map(changes => changes.payload.val());
  }

  addUserData(data: Profile) {
    //Create new User with uid Key
    //this.getUserData();
    data.oneSignalId = this.notifications.one_id;
    data.settings = {age: '', city: '', country: '', disciplines: '', displayName: '', gender: '',level: ''};
    this.userDataRef.set(data);
    return this.userData ;
  }

  saveUserData(data: any) {
    this.userDataRef.set(data);
  }

  //updateUserData(data: Profile) {
  updateUserData(data:any) {
    this.userDataRef.update(data);
    console.log(this.userData);
    return this.userData;
  }

  checkOneSignalID() {
    let one_id = this.notifications.one_id;
    let userData = (this.userData) ? this.userData : this.getUserData() ;
    userData.subscribe((userData) => {
      console.log('getUserData checkOneSignalID user-provider');
      if(one_id && one_id != userData.oneSignalId){
        this.userDataRef.update({'oneSignalId': one_id});
      }
    });
  }




  //OK
  signInUser(email: string, password: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  //OK
  signUpUser(name: string, newEmail: string, newPassword: string): Promise<any> {
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
  resetPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }


  //OK
  signInWithProvider(provider:string): Promise<any> {

    const providers = {
      gp : 'Google+',
      fb : 'Facebook'
    }

    let signInGP;
    let is_cordova = this.platform.is('cordova');
    if(provider == providers.gp){
      signInGP = (is_cordova) ? this.googlePlus.login({ 'webClientId': '897213692051-lvpeb0c5t59slq2e5uoobrmpa54f5i11.apps.googleusercontent.com', 'offline': true }) : this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }else if(provider == providers.fb){
      signInGP = (is_cordova) ? this.fb.login(['email', 'public_profile']) : this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()) ;
    }else{
      throw 'need provider';
    }
    return signInGP.then(res => {
      if(is_cordova){
        let sdkCredential = (provider == providers.fb) ? firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken) : firebase.auth.GoogleAuthProvider.credential(res.idToken);
        return this.afAuth.auth.signInWithCredential(sdkCredential).then(user => {

          return user;
        }).catch( (error) => {
          throw error ;
        });
      }else{

        return res.user;
      }
    }).catch( (error) => {
      throw error ;
    });

  }


  /**
   * Log the user out, which forgets the session
   */
  //OK
  logout() {
    this.events.publish('user:logout');
    return this.afAuth.auth.signOut();
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
            //this.afAuth.auth.signOut()
            this.logout().then(() => {
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
          });

      })
      .catch((error) => {
        //show error
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
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
          throw error;
        })
      })
      .catch((error) => {
        this.loadingProvider.hide();
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
      throw error;
    })
  }
  //OK
  checkEmailIsVerified(): Promise<boolean>{
    let that = this;
    return new Promise<boolean>((resolve, reject) => {
      let checkVerified = setInterval(function() {
        console.log('ticking');
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
