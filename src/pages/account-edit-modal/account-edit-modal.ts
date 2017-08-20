import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl, ValidationErrors } from '@angular/forms';

import { CustomValidators } from 'ng2-validation';
import { EmailValidator } from '../../validators/email';

import { LoadingProvider, AlertProvider } from '../../providers';

/**
 * Generated class for the AccountEditModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-account-edit-modal',
  templateUrl: 'account-edit-modal.html',
})
export class AccountEditModalPage {

  editAccountForm: FormGroup;
  field: null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private viewCtrl: ViewController,
    public loadingProvider: LoadingProvider,
    public alertProvider: AlertProvider
  ) {

    let field = this.navParams.data.field;
    this.field = field;
    let currentPassword = new FormControl('', Validators.required );
    let newPassword = new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)]));
    let confirmPassword = new FormControl('', CustomValidators.equalTo(newPassword));
    let email = new FormControl('guillaume.bartolini+12@gmail.com', Validators.compose([EmailValidator.isValid, Validators.required]) );
    let group = {};
    if(field == 'password'){
      group = { currentPassword, newPassword, confirmPassword }
    }
    if(field == 'email'){
      group = { email }
    }

    this.editAccountForm = formBuilder.group(group);
    this.editAccountForm.valueChanges
    		.debounceTime(400)
    		.subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.editAccountForm) { return; }
  }


  dismiss() {
    this.viewCtrl.dismiss('cancel');
  }

  editAccountFormSubmit(){
    let errType;

    if (!this.editAccountForm.valid) {
      Object.keys(this.editAccountForm.controls).forEach(key => {
        const controlErrors: ValidationErrors = this.editAccountForm.get(key).errors;
        if (controlErrors != null) {
          console.log(controlErrors);
          Object.keys(controlErrors).forEach(keyError => {
            errType = '';
            errType = 'field/'+keyError;
          });
        }
      });
      this.alertProvider.showErrorMessage(errType);
      return;
    } else {
      this.viewCtrl.dismiss(this.editAccountForm.value);
    }
  }



}
