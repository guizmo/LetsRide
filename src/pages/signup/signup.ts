import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
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

  private signupErrorString: string;
  public signupForm: FormGroup;
  activeMenu = 'AccountPage';



  constructor(
    public navCtrl: NavController,
    public userProvider: UserProvider,
    public translateService: TranslateService,
    private formBuilder: FormBuilder,
    public loadingProvider: LoadingProvider,
    public alertProvider: AlertProvider
  ) {
    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })

    this.signupForm = formBuilder.group({
        name: ['', Validators.compose([Validators.required])],
        email: ['', Validators.compose([EmailValidator.isValid, Validators.required])],
        password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    })
  }


  signUpFormSubmit() {
    if (!this.signupForm.valid) {
      let errType;

      Object.keys(this.signupForm.controls).forEach(key => {
        const controlErrors: ValidationErrors = this.signupForm.get(key).errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            errType = 'field/'+keyError;
          });
        }
      });
      console.log(errType);
      this.alertProvider.showErrorMessage(errType);
      return
    } else {


      this.loadingProvider.show();
      this.userProvider.signUpUser(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password)
        .then((user) => {
          this.loadingProvider.hide();
          this.alertProvider.showEmailVerificationSentToast(this.signupForm.value.email);

          let providerData = {...user.providerData[0], ...{ aFuid: user.uid, profileImg: {}, settings : { displayName : user.displayName } } };

          this.userProvider.addUserData(providerData).subscribe((data) => {
            if(data.aFuid){
              this.navCtrl.setRoot('ProfilePage', {...providerData, ...{'emailVerified': user.emailVerified} });
            }else{
              this.alertProvider.showErrorMessage('database/generique');
            }
          });

        },
        (error) => {
          this.loadingProvider.hide();
          let code = error["code"];
          this.alertProvider.showErrorMessage(code);
        })
    }
  }


}
