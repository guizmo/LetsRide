import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from '../../validators/email';

import { User } from '../../providers/user';

import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { TranslateService } from '@ngx-translate/core';


@IonicPage({
    defaultHistory: ['LoginPage']
})
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type

  // Our translated text strings
  private signupErrorString: string;
  public signupForm: FormGroup;


  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private formBuilder: FormBuilder,
    private spinnerDialog: SpinnerDialog
  ) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })

    this.signupForm = formBuilder.group({
        name: ['Guizmo Barto', Validators.compose([Validators.required])],
        email: ['guillaume.bartolini@gmail.com', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['qwer12', Validators.compose([Validators.minLength(6), Validators.required])]
    })
  }

  createToast(message: string) {
    return this.toastCtrl.create({
      message,
      duration: 3000
    })
  }

  signUpFormSubmit() {
    if (!this.signupForm.valid) {
      this.createToast('Form not valid').present();
      return
    }
    else {
      this.spinnerDialog.show(null,'Loading',true,{overlayOpacity:0.60});

      this.user.signUpUser(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password)
        .then(() => {
          this.spinnerDialog.hide();
          this.createToast('Signed in with email: ' + this.signupForm.value.email).present();
          this.navCtrl.setRoot('ProfilePage');
        },
        (error) => {
          this.spinnerDialog.hide();
          this.createToast(error.message).present();
        })
    }
  }


}
