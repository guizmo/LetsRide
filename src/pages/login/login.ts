import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { MainPage } from '../../pages';

import { User } from '../../providers/user';

import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type


  pushPage: any;
  public signInForm: FormGroup;

  // Our translated text strings
  private loginErrorString: string;

  constructor(
    public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private formBuilder: FormBuilder,
    private spinnerDialog: SpinnerDialog
  ) {



    this.signInForm = formBuilder.group({
      email: ['guillaume.bartolini@gmail.com', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })

  }

  signInWithFacebook() {
    this.user.signInWithFacebook()
    .then((res) => {
      console.log('user', res)

      this.createToast('Signed in with FACEBOOK: ' + res.user.displayName).present();
      this.navCtrl.setRoot(MainPage);
    },
    (error) => {
      this.createToast(error.message).present();
    })
  }

  createToast(message: string) {
    return this.toastCtrl.create({
      message,
      duration: 3000
    })
  }

  signInFormSubmit() {
    if (!this.signInForm.valid) {
      this.createToast('Form not valid').present();
      return
    }
    else {
      this.spinnerDialog.show(null,'Waiting ...',true,{overlayOpacity:0.60});

      this.user.signInUser(this.signInForm.value.email, this.signInForm.value.password)
        .then(() => {
          this.spinnerDialog.hide();
          this.createToast('Signed in with email: ' + this.signInForm.value.email).present();
          this.navCtrl.setRoot(MainPage);
        },
        (error) => {
          this.spinnerDialog.hide();
          this.createToast(error.message).present();
        })
    }
  }




}
