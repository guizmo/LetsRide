import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';


import { UserProvider, LoadingProvider } from '../../providers';

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
    public userProvider: UserProvider,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private formBuilder: FormBuilder,
    public loadingProvider: LoadingProvider
  ) {



    this.signInForm = formBuilder.group({
      email: ['guillaume.bartolini@gmail.com', Validators.compose([Validators.required, Validators.email])],
      password: ['qwer12', Validators.compose([Validators.minLength(6), Validators.required])]
    });

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })

  }


  signInWithProvider(provider:string) {
    this.userProvider.signInWithProvider(provider)
      .then((user) => {
        console.log('Signed in with ' + provider + ' : ' , user)

        this.createToast('Signed in with ' + provider + ': ' + user.displayName).present();
        this.userProvider.afdb.object(`/users/${user.uid}`).subscribe((data) => {
            if(data.$exists()){
              this.navCtrl.setRoot('MainPage');
            }else{
              let providerData = {...user.providerData[0], ...{ aFuid: user.uid, profileImg:{}, settings : { displayName : user.displayName } } };
              this.userProvider.addUserData(providerData).subscribe((data) => {
                if(data.aFuid){
                  this.navCtrl.setRoot('ProfilePage', {...providerData, ...{'emailVerified': true} } );
                }else{
                  console.error('Database create didnt work');
                  throw 'Database create didnt work';
                }
              });

            }
        });

      }).catch( (error) => {
        this.createToast(error.message).present();
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
      this.createToast('Form not valid').present();
      return
    }
    else {
      this.loadingProvider.show();

      this.userProvider.signInUser(this.signInForm.value.email, this.signInForm.value.password)
        .then((success) => {
          this.loadingProvider.hide();
          this.createToast('Signed in with email: ' + this.signInForm.value.email).present();

          this.userProvider.checkEmailIsVerified();

          this.navCtrl.setRoot('MainPage');
        },
        (error) => {
          this.loadingProvider.hide();
          this.createToast(error.message).present();
        })
    }
  }




}
