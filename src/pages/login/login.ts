import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController, Slides } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { EmailValidator } from '../../validators/email';

import { UserProvider, LoadingProvider, AlertProvider } from '../../providers';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  @ViewChild(Slides) slides: Slides;

  currentIndex:number = 0;
  pushPage:any;
  slideState: string = null;

  public signInForm: FormGroup;
  public resetPasswordForm:FormGroup;

  // Our translated text strings
  private loginErrorString: string;

  constructor(
    public navCtrl: NavController,
    public afAuth: AngularFireAuth,
    public userProvider: UserProvider,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private formBuilder: FormBuilder,
    public alertProvider: AlertProvider,
    public loadingProvider: LoadingProvider
  ) {
    afAuth.authState.subscribe((_user: firebase.User) => {
      if (_user) {
        this.navCtrl.setRoot('MainPage');
      }
    });



    this.signInForm = formBuilder.group({
      email: ['guillaume.bartolini@gmail.com', Validators.compose([EmailValidator.isValid, Validators.required])],
      password: ['qwer12', Validators.compose([Validators.required])]
    });


    this.resetPasswordForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  slideTo(index) {
    if (!this.slideState) {
      this.slides.lockSwipes(false);
      this.slides.slideTo(index);
      this.slideState = 'moving';
      this.slides.lockSwipes(true);
    }
  }

  slideChanged(){
    this.slideState = null;
    this.currentIndex = this.slides.getActiveIndex();
  }
  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }

  signInWithProvider(provider:string) {
    this.userProvider.signInWithProvider(provider)
      .then((user) => {

        this.alertProvider.showSignInToast(provider + ': ' + user.displayName);

        this.userProvider.afdb.object(`/users/${user.uid}`).subscribe((data) => {
            if(data.$exists()){
              this.navCtrl.setRoot('MainPage');
            }else{
              let providerData = {...user.providerData[0], ...{ aFuid: user.uid, profileImg:{}, settings : { displayName : user.displayName } } };
              this.userProvider.addUserData(providerData).subscribe((data) => {
                if(data.aFuid){
                  this.navCtrl.setRoot('ProfilePage', {...providerData, ...{'emailVerified': true} } );
                }else{
                  this.alertProvider.showErrorMessage('database/generique');
                }
              });

            }
        });

      }).catch( (error) => {
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

  createToast(message: string) {
    return this.toastCtrl.create({
      message,
      duration: 3000
    })
  }

  signInFormSubmit() {
    if (!this.signInForm.valid) {
      let errType;

      Object.keys(this.signInForm.controls).forEach(key => {
        const controlErrors: ValidationErrors = this.signInForm.get(key).errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            errType = '';
            errType = 'field/'+keyError;
          });
        }
      });
      this.alertProvider.showErrorMessage(errType);
      return
    }
    else {
      this.loadingProvider.show();

      this.userProvider.signInUser(this.signInForm.value.email, this.signInForm.value.password)
        .then((success) => {
          this.loadingProvider.hide();

          this.alertProvider.showSignInToast('email: ' + this.signInForm.value.email);
          this.userProvider.checkEmailIsVerified();

          this.navCtrl.setRoot('MainPage');
        },
        (error) => {
          this.loadingProvider.hide();
          let code = error["code"];
          this.alertProvider.showErrorMessage(code);
        })
    }
  }


  resetPassword(){
    if (!this.resetPasswordForm.valid){
    } else {
      this.loadingProvider.show();

      this.userProvider.resetPassword(this.resetPasswordForm.value.email)
      .then((user) => {
        this.loadingProvider.hide();

        this.alertProvider.showPasswordResetMessage(this.resetPasswordForm.value.email);
        this.slideTo(1);

      }, (error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });

    }
  }


}
