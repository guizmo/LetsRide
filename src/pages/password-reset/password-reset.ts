import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from '../../validators/email';

import { MainPage, SignupPage } from '../../pages';

import { User } from '../../providers/user';

import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


/**
 * Generated class for the PasswordResetPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-password-reset',
  templateUrl: 'password-reset.html',
})
export class PasswordResetPage {
  public resetPasswordForm:FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public user: User,
    private afAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private spinnerDialog: SpinnerDialog
  ) {
    this.resetPasswordForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PasswordResetPage');
  }


  resetPassword(){
    if (!this.resetPasswordForm.valid){
      console.log(this.resetPasswordForm.value);
    } else {
      this.user.resetPassword(this.resetPasswordForm.value.email)
    }
  }

}
