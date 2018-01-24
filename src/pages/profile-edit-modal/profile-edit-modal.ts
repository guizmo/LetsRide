import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { Discipline, Country } from '../../models';


@IonicPage()
@Component({
  selector: 'page-profile-edit-modal',
  templateUrl: 'profile-edit-modal.html',
})
export class ProfileEditModalPage {

  private disciplines: ReadonlyArray<Discipline>;
  private countries: ReadonlyArray<Country>;

  activeMenu = 'ProfilePage';
  editProfileForm: FormGroup;
  localProfile: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public translateService: TranslateService,
  ) {
    this.translateService.get(['COUNTRIES', 'DISCIPLINES']).subscribe((values) => {
      this.disciplines = values.DISCIPLINES.sort(function(a, b) {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });
      this.countries = values.COUNTRIES.sort(function(a, b) {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      })
    })


    const emptyValues = {
      disciplines: '',
      country: '',
      gender: '',
      age: '',
      city: '',
      level: ''
    }

    let ProfilValues = this.navParams.data.profile != null ? this.navParams.data.profile : emptyValues;

    let displayName = this.navParams.data.user.displayName;
    let { disciplines = '', country = '', gender = '', age = '', city = '', level = '' } = ProfilValues;

    if(this.navParams.data.profile != null){
      displayName = this.navParams.data.profile.displayName || displayName;
    }

    //console.log('disciplines 2', disciplines)
    let controls = {
      disciplines: [disciplines],
      country: country,
      gender: gender,
      age: age,
      city: city,
      level: level,
      displayName: [displayName, Validators.compose([Validators.required])]
    }
    this.editProfileForm = this.formBuilder.group(controls);

  }


  dismiss() {
    this.viewCtrl.dismiss('cancel');
  }

  //test select event
  onSelectChange(selectedValue) {
    console.log('Selected');
  }

  editProfileFormSubmit(){
    if (!this.editProfileForm.valid) {
      //NOT VALID
      return
    } else {
      this.viewCtrl.dismiss(this.editProfileForm.value);
    }
  }


}
