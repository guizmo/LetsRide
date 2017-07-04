import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from '../../validators/email';

import { UserProvider, LoadingProvider, AlertProvider } from '../../providers';

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
    public userProvider: UserProvider,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private formBuilder: FormBuilder,
    public loadingProvider: LoadingProvider,
    public alertProvider: AlertProvider
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

  createToast(message: string, duration: number = 3000, showCloseButton: boolean = null) {
    return this.toastCtrl.create({
      message,
      duration,
      showCloseButton,
      closeButtonText: 'OK'
    })
  }

  signUpFormSubmit() {
    if (!this.signupForm.valid) {
      this.createToast('Form not valid').present();
      return
    }
    else {
      this.loadingProvider.show();
      this.userProvider.signUpUser(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password)
        .then((newUser) => {
          this.loadingProvider.hide();
          this.createToast(
            this.alertProvider.successMessages.emailVerificationSent.subTitle + this.signupForm.value.email ,
            5000,
            true
          ).present();

          this.userProvider.setLocalProfiles({'displayName':this.signupForm.value.name}, newUser.uid)
            .then((data) => {
              this.navCtrl.setRoot('ProfilePage', {'emailVerified': false, 'displayName':this.signupForm.value.name, 'aFuid': newUser.uid});
            })

        },
        (error) => {
          this.loadingProvider.hide();
          this.createToast(error.message).present();
        })
    }
  }


}
