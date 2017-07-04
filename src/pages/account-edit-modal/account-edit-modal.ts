import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { CustomValidators } from 'ng2-validation';
import { LoadingProvider } from '../../providers';

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
    public loadingProvider: LoadingProvider
  ) {

    let field = this.navParams.data.field;
    this.field = field;
    let currentPassword = new FormControl('', Validators.required );
    let newPassword = new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)]));
    let confirmPassword = new FormControl('', CustomValidators.equalTo(newPassword));
    let email = new FormControl(this.navParams.data.user.email, Validators.compose([Validators.required, Validators.email]) );
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

    if (!this.editAccountForm.valid) {
      //NOT VALID
      return
    } else {
      this.viewCtrl.dismiss(this.editAccountForm.value);
    }
  }



}
