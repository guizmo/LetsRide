import { Injectable } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';
//import { Validator } from '../validator';
const errorMessages = {
  // Alert Provider
  // This is the provider class for most of the success and error messages in the app.
  // If you added your own messages don't forget to make a function for them or add them in the showErrorMessage switch block.

  // Firebase Error Messages
  accountExistsWithDifferentCredential: { title: 'Account Exists!', subTitle: 'An account with the same credential already exists.' },
  invalidCredential: { title: 'Invalid Credential!', subTitle: 'An error occured logging in with this credential.' },
  operationNotAllowed: { title: 'Login Failed!', subTitle: 'Logging in with this provider is not allowed! Please contact support.' },
  userDisabled: { title: 'Account Disabled!', subTitle: 'Sorry! But this account has been suspended! Please contact support.' },
  userNotFound: { title: 'Account Not Found!', subTitle: 'Sorry, but an account with this credential could not be found.' },
  wrongPassword: { title: 'Incorrect Password!', subTitle: 'Sorry, but the password you have entered is incorrect.' },
  invalidEmail: { title: 'Invalid Email!', subTitle: 'Sorry, but you have entered an invalid email address.' },
  emailAlreadyInUse: { title: 'Email Not Available!', subTitle: 'Sorry, but this email is already in use.' },
  weakPassword: { title: 'Weak Password!', subTitle: 'Sorry, but you have entered a weak password.' },
  requiresRecentLogin: { title: 'Credential Expired!', subTitle: 'Sorry, but this credential has expired! Please login again.' },
  userMismatch: { title: 'User Mismatch!', subTitle: 'Sorry, but this credential is for another user!' },
  providerAlreadyLinked: { title: 'Already Linked!', subTitle: 'Sorry, but your account is already linked to this credential.' },
  credentialAlreadyInUse: { title: 'Credential Not Available!', subTitle: 'Sorry, but this credential is already used by another user.' },
  // Profile Error Messages
  changeName: { title: 'Change Name Failed!', subTitle: 'Sorry, but we\'ve encountered an error changing your name.' },
  invalidCharsName: 'Validator.profileNameValidator.patternError',
  nameTooShort: 'Validator.profileNameValidator.lengthError',
  changeEmail: { title: 'Change Email Failed!', subTitle: 'Sorry, but we\'ve encountered an error changing your email address.' },
  invalidProfileEmail: 'Validator.profileEmailValidator.patternError',
  changePhoto: { title: 'Change Photo Failed!', subTitle: 'Sorry, but we\'ve encountered an error changing your photo.' },
  passwordTooShort: 'Validator.profilePasswordValidator.lengthError',
  invalidCharsPassword: 'Validator.profilePasswordValidator.patternError',
  passwordsDoNotMatch: { title: 'Change Password Failed!', subTitle: 'Sorry, but the passwords you entered do not match.' },
  // Image Error Messages
  imageUpload: { title: 'Image Upload Failed!', subTitle: 'Sorry but we\'ve encountered an error uploading selected image.' },
  // field required
  fieldRequired: {
    title: 'Field required !',
    subTitle: 'Sorry, but you forgot to fill up some fields'
  },
  databaseGenerique: {
    title: 'Connection error !',
    subTitle: 'An error occured! Please try again later.'
  },
  noPlacesYet: {
    title: 'No localisation!',
    subTitle: 'There is no localisation for this place yet.'
  }
};

const successMessages = {
  passwordResetSent: { title: 'Password Reset Sent!', subTitle: 'A password reset email has been sent to: ' },
  profileUpdated: { title: 'Profile Updated!', subTitle: 'Your profile has been successfully updated!' },
  emailVerified: { title: 'Email Confirmed!', subTitle: 'Congratulations! Your email has been confirmed!' },
  emailVerificationSent: { title: 'Email Confirmation Sent!', subTitle: 'An email confirmation has been sent to: ' },
  accountDeleted: { title: 'Account Deleted!', subTitle: 'Your account has been successfully deleted.' },
  passwordChanged: { title: 'Password Changed!', subTitle: 'Your password has been successfully changed.' },
  signIn: { title: 'Signed in!', subTitle: 'Signed in with ' }
};

const comfirmMessages = {
  emailUpdate: { title: 'Email Update Confirmation!', subTitle: 'An email confirmation will be sent to: ', next: 'Proceed', back: 'Cancel' },
}

@Injectable()
export class AlertProvider {
  public alert;
  public toast;

  public successMessages;
  public errorMessages;
  public comfirmMessages;

  constructor(
    public toastCtrl: ToastController,
    public alertCtrl: AlertController
  ) {
    this.successMessages = successMessages;
    this.errorMessages = errorMessages;
    this.comfirmMessages = comfirmMessages;
  }


  // Show profile updated
  showProfileUpdatedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.profileUpdated["title"],
      subTitle: successMessages.profileUpdated["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // Show password reset sent
  showPasswordResetMessage(email) {
    this.alert = this.alertCtrl.create({
      title: successMessages.passwordResetSent["title"],
      subTitle: successMessages.passwordResetSent["subTitle"] + email,
      buttons: ['OK']
    }).present();
  }

  // Show email verified and redirect to homePage
  showEmailVerifiedMessageAndRedirect(navCtrl) {
    this.alert = this.alertCtrl.create({
      title: successMessages.emailVerified["title"],
      subTitle: successMessages.emailVerified["subTitle"],
      buttons: [{
        text: 'OK',
        handler: () => {
          navCtrl.setRoot('MainPage');
        }
      }]
    }).present();
  }
  // Show email verified
  showEmailVerifiedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.emailVerified["title"],
      subTitle: successMessages.emailVerified["subTitle"],
      buttons: [{
        text: 'OK',
        handler: () => {
        }
      }]
    }).present();
  }

  // Show email verification sent
  showEmailVerificationSentMessage(email) {
    this.alert = this.alertCtrl.create({
      title: successMessages.emailVerificationSent["title"],
      subTitle: successMessages.emailVerificationSent["subTitle"] + email,
      buttons: ['OK']
    }).present();
  }


  // Show account deleted
  showAccountDeletedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.accountDeleted["title"],
      subTitle: successMessages.accountDeleted["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // Show password changed
  showPasswordChangedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.passwordChanged["title"],
      subTitle: successMessages.passwordChanged["subTitle"],
      buttons: ['OK']
    }).present();
  }

  //TOASTS
  // Show email verification sent
  showEmailVerificationSentToast(email) {
    this.toast = this.toastCtrl.create({
      message: successMessages.emailVerificationSent["subTitle"] + email,
      showCloseButton: true,
      duration: 10000,
      closeButtonText: 'OK'
    }).present();
  }

  showSignInToast(msg) {
    this.toast = this.toastCtrl.create({
      message: successMessages.signIn["subTitle"] + msg,
      showCloseButton: true,
      duration: 3000,
      closeButtonText: 'OK'
    }).present();
  }


  // Show error messages depending on the code
  // If you added custom error codes on top, make sure to add a case block for it.
  showErrorMessage(code) {
    switch (code) {
      // Firebase Error Messages
      case 'auth/account-exists-with-different-credential':
        this.alert = this.alertCtrl.create({
          title: errorMessages.accountExistsWithDifferentCredential["title"],
          subTitle: errorMessages.accountExistsWithDifferentCredential["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/invalid-credential':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidCredential["title"],
          subTitle: errorMessages.invalidCredential["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/operation-not-allowed':
        this.alert = this.alertCtrl.create({
          title: errorMessages.operationNotAllowed["title"],
          subTitle: errorMessages.operationNotAllowed["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/user-disabled':
        this.alert = this.alertCtrl.create({
          title: errorMessages.userDisabled["title"],
          subTitle: errorMessages.userDisabled["subTitle"],
          buttons: ['OK']
        });
        this.alert.present();
        break;
      case 'auth/user-not-found':
        this.alert = this.alertCtrl.create({
          title: errorMessages.userNotFound["title"],
          subTitle: errorMessages.userNotFound["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/wrong-password':
        this.alert = this.alertCtrl.create({
          title: errorMessages.wrongPassword["title"],
          subTitle: errorMessages.wrongPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/invalid-email':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidEmail["title"],
          subTitle: errorMessages.invalidEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/email-already-in-use':
        this.alert = this.alertCtrl.create({
          title: errorMessages.emailAlreadyInUse["title"],
          subTitle: errorMessages.emailAlreadyInUse["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/weak-password':
        this.alert = this.alertCtrl.create({
          title: errorMessages.weakPassword["title"],
          subTitle: errorMessages.weakPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/requires-recent-login':
        this.alert = this.alertCtrl.create({
          title: errorMessages.requiresRecentLogin["title"],
          subTitle: errorMessages.requiresRecentLogin["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/user-mismatch':
        this.alert = this.alertCtrl.create({
          title: errorMessages.userMismatch["title"],
          subTitle: errorMessages.userMismatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/provider-already-linked':
        this.alert = this.alertCtrl.create({
          title: errorMessages.providerAlreadyLinked["title"],
          subTitle: errorMessages.providerAlreadyLinked["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/credential-already-in-use':
        this.alert = this.alertCtrl.create({
          title: errorMessages.credentialAlreadyInUse["title"],
          subTitle: errorMessages.credentialAlreadyInUse["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      // Profile Error Messages
      case 'profile/error-change-name':
        this.alert = this.alertCtrl.create({
          title: errorMessages.changeName["title"],
          subTitle: errorMessages.changeName["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-chars-name':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidCharsName["title"],
          subTitle: errorMessages.invalidCharsName["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/name-too-short':
        this.alert = this.alertCtrl.create({
          title: errorMessages.nameTooShort["title"],
          subTitle: errorMessages.nameTooShort["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-change-email':
        this.alert = this.alertCtrl.create({
          title: errorMessages.changeEmail["title"],
          subTitle: errorMessages.changeEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-email':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidProfileEmail["title"],
          subTitle: errorMessages.invalidProfileEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-change-photo':
        this.alert = this.alertCtrl.create({
          title: errorMessages.changePhoto["title"],
          subTitle: errorMessages.changePhoto["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/password-too-short':
        this.alert = this.alertCtrl.create({
          title: errorMessages.passwordTooShort["title"],
          subTitle: errorMessages.passwordTooShort["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-chars-password':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidCharsPassword["title"],
          subTitle: errorMessages.invalidCharsPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/passwords-do-not-match':
        this.alert = this.alertCtrl.create({
          title: errorMessages.passwordsDoNotMatch["title"],
          subTitle: errorMessages.passwordsDoNotMatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Image Error Messages
      case 'image/error-image-upload':
        this.alert = this.alertCtrl.create({
          title: errorMessages.imageUpload["title"],
          subTitle: errorMessages.imageUpload["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Field required Error Messages
      case 'field/required':
        this.alert = this.alertCtrl.create({
          title: errorMessages.fieldRequired["title"],
          subTitle: errorMessages.fieldRequired["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Field required Error Messages
      case 'field/invalidEmail':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidEmail["title"],
          subTitle: errorMessages.invalidEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Field required Error Messages
      case 'field/minlength':
        this.alert = this.alertCtrl.create({
          title: errorMessages.weakPassword["title"],
          subTitle: errorMessages.weakPassword["subTitle"] + ' It must be at least 6 characters long !',
          buttons: ['OK']
        }).present();
        break;
      case 'database/generique':
        this.alert = this.alertCtrl.create({
          title: errorMessages.databaseGenerique["title"],
          subTitle: errorMessages.databaseGenerique["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'field/equalTo':
        this.alert = this.alertCtrl.create({
          title: errorMessages.passwordsDoNotMatch["title"],
          subTitle: errorMessages.passwordsDoNotMatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'places/none':
        this.alert = this.alertCtrl.create({
          title: errorMessages.noPlacesYet["title"],
          subTitle: errorMessages.noPlacesYet["subTitle"],
          buttons: ['OK']
        }).present();
        break;

    }
  }
}
