import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from '../../validators/email';

import { UserProvider } from '../../providers';

import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { TranslateService } from '@ngx-translate/core';


/**
 * Generated class for the PasswordResetPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({
    defaultHistory: ['LoginPage']
})
@Component({
  selector: 'page-password-reset',
  templateUrl: 'password-reset.html',
})
export class PasswordResetPage {
  public resetPasswordForm:FormGroup;

  constructor(
    public navCtrl: NavController,
    public translateService: TranslateService,
    public navParams: NavParams,
    public userProvider: UserProvider,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private spinnerDialog: SpinnerDialog
  ) {
    this.resetPasswordForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });

  }

  createToast(message: string) {
    return this.toastCtrl.create({
      message,
      dismissOnPageChange: true,
      closeButtonText: 'OK',
      showCloseButton: true
    })
  }


  resetPassword(){
    if (!this.resetPasswordForm.valid){
    } else {
      this.spinnerDialog.show(null,'Waiting ...',true,{overlayOpacity:0.60});

      this.userProvider.resetPassword(this.resetPasswordForm.value.email)
      .then((user) => {
        this.spinnerDialog.hide();

        let toast = this.createToast('We just sent you a reset link to your email to: ' + this.resetPasswordForm.value.email)
        toast.present();

        toast.onDidDismiss(() => {
          this.navCtrl.pop();
        });


      }, (error) => {
        this.spinnerDialog.hide();
        var errorMessage: string = error.message;
        this.createToast(errorMessage).present();
      });

    }
  }

}
