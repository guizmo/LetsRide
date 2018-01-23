import { Injectable } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';


const arrayTotranslate = ['errorMessages', 'confirmMessages', 'successMessages'];

@Injectable()
export class AlertProvider {
  public alert;
  public toast;

  public successMessages;
  public errorMessages;
  public confirmMessages;

  constructor(
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private translate: TranslateService
  ) {
    this.translate.get(arrayTotranslate).subscribe( values => {
      this.errorMessages = values.errorMessages;
      this.confirmMessages = values.confirmMessages;
      this.successMessages = values.successMessages;
    });
  }


  // Show profile updated
  showProfileUpdatedMessage() {
    this.alert = this.alertCtrl.create({
      title: this.successMessages.profileUpdated["title"],
      subTitle: this.successMessages.profileUpdated["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // Show password reset sent
  showPasswordResetMessage(email) {
    this.alert = this.alertCtrl.create({
      title: this.successMessages.passwordResetSent["title"],
      subTitle: this.successMessages.passwordResetSent["subTitle"] + email,
      buttons: ['OK']
    }).present();
  }

  // Show email verified and redirect to homePage
  showEmailVerifiedMessageAndRedirect(navCtrl) {
    this.alert = this.alertCtrl.create({
      title: this.successMessages.emailVerified["title"],
      subTitle: this.successMessages.emailVerified["subTitle"],
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
      title: this.successMessages.emailVerified["title"],
      subTitle: this.successMessages.emailVerified["subTitle"],
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
      title: this.successMessages.emailVerificationSent["title"],
      subTitle: this.successMessages.emailVerificationSent["subTitle"] + email,
      buttons: ['OK']
    }).present();
  }


  // Show account deleted
  showAccountDeletedMessage() {
    this.alert = this.alertCtrl.create({
      title: this.successMessages.accountDeleted["title"],
      subTitle: this.successMessages.accountDeleted["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // Show password changed
  showPasswordChangedMessage() {
    this.alert = this.alertCtrl.create({
      title: this.successMessages.passwordChanged["title"],
      subTitle: this.successMessages.passwordChanged["subTitle"],
      buttons: ['OK']
    }).present();
  }

  //TOASTS
  // Show email verification sent
  showEmailVerificationSentToast(email) {
    this.toast = this.toastCtrl.create({
      message: this.successMessages.emailVerificationSent["subTitle"] + email,
      showCloseButton: true,
      duration: 10000,
      closeButtonText: 'OK'
    }).present();
  }

  showSignInToast(msg) {
    this.toast = this.toastCtrl.create({
      message: this.successMessages.signIn["subTitle"] + msg,
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
          title: this.errorMessages.accountExistsWithDifferentCredential["title"],
          subTitle: this.errorMessages.accountExistsWithDifferentCredential["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/invalid-credential':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.invalidCredential["title"],
          subTitle: this.errorMessages.invalidCredential["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/operation-not-allowed':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.operationNotAllowed["title"],
          subTitle: this.errorMessages.operationNotAllowed["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/user-disabled':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.userDisabled["title"],
          subTitle: this.errorMessages.userDisabled["subTitle"],
          buttons: ['OK']
        });
        this.alert.present();
        break;
      case 'auth/user-not-found':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.userNotFound["title"],
          subTitle: this.errorMessages.userNotFound["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/wrong-password':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.wrongPassword["title"],
          subTitle: this.errorMessages.wrongPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/invalid-email':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.invalidEmail["title"],
          subTitle: this.errorMessages.invalidEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/email-already-in-use':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.emailAlreadyInUse["title"],
          subTitle: this.errorMessages.emailAlreadyInUse["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/weak-password':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.weakPassword["title"],
          subTitle: this.errorMessages.weakPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/requires-recent-login':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.requiresRecentLogin["title"],
          subTitle: this.errorMessages.requiresRecentLogin["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/user-mismatch':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.userMismatch["title"],
          subTitle: this.errorMessages.userMismatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/provider-already-linked':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.providerAlreadyLinked["title"],
          subTitle: this.errorMessages.providerAlreadyLinked["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/credential-already-in-use':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.credentialAlreadyInUse["title"],
          subTitle: this.errorMessages.credentialAlreadyInUse["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      // Profile Error Messages
      case 'profile/error-change-name':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.changeName["title"],
          subTitle: this.errorMessages.changeName["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-chars-name':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.invalidCharsName["title"],
          subTitle: this.errorMessages.invalidCharsName["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/name-too-short':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.nameTooShort["title"],
          subTitle: this.errorMessages.nameTooShort["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-change-email':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.changeEmail["title"],
          subTitle: this.errorMessages.changeEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-email':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.invalidProfileEmail["title"],
          subTitle: this.errorMessages.invalidProfileEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-change-photo':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.changePhoto["title"],
          subTitle: this.errorMessages.changePhoto["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/password-too-short':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.passwordTooShort["title"],
          subTitle: this.errorMessages.passwordTooShort["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-chars-password':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.invalidCharsPassword["title"],
          subTitle: this.errorMessages.invalidCharsPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/passwords-do-not-match':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.passwordsDoNotMatch["title"],
          subTitle: this.errorMessages.passwordsDoNotMatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Image Error Messages
      case 'image/error-image-upload':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.imageUpload["title"],
          subTitle: this.errorMessages.imageUpload["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Field required Error Messages
      case 'field/required':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.fieldRequired["title"],
          subTitle: this.errorMessages.fieldRequired["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Field required Error Messages
      case 'field/invalidEmail':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.invalidEmail["title"],
          subTitle: this.errorMessages.invalidEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      //Field required Error Messages
      case 'field/minlength':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.weakPassword["title"],
          subTitle: this.errorMessages.weakPassword["subTitle"] + ' ' + this.errorMessages.weakPassword["length"],
          buttons: ['OK']
        }).present();
        break;
      case 'database/generique':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.databaseGenerique["title"],
          subTitle: this.errorMessages.databaseGenerique["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'field/equalTo':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.passwordsDoNotMatch["title"],
          subTitle: this.errorMessages.passwordsDoNotMatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'places/none':
        this.alert = this.alertCtrl.create({
          title: this.errorMessages.noPlacesYet["title"],
          subTitle: this.errorMessages.noPlacesYet["subTitle"],
          buttons: ['OK']
        }).present();
        break;

    }
  }
}
