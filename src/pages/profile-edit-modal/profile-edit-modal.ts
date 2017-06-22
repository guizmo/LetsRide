import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DisciplinesProvider, CountriesProvider } from '../../providers';
import { Discipline, Country } from '../../models';

/**
 * Generated class for the ProfileEditModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile-edit-modal',
  templateUrl: 'profile-edit-modal.html',
})
export class ProfileEditModalPage {

  private disciplines: ReadonlyArray<Discipline>;
  private countries: ReadonlyArray<Country>;

  editProfileForm: FormGroup;
  localProfile: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public disciplinesProvider: DisciplinesProvider,
    public countriesProvider: CountriesProvider
  ) {
    let displayName = this.navParams.data.user.displayName;
    let { disciplines, country, gender , age , city, level } = this.navParams.data.profile;
    if(this.navParams.data.profile != null){
      displayName = this.navParams.data.profile.displayName || displayName;
    }

    console.log('disciplines', disciplines)
    this.editProfileForm = formBuilder.group({
      disciplines: [disciplines],
      country: country,
      gender: gender,
      age: age,
      city: city,
      level: level,
      displayName: [displayName, Validators.compose([Validators.required])]
    });


  }

  ngOnInit() {
    this.disciplinesProvider.findAll().subscribe(
      data => this.disciplines = data
    );
    this.countriesProvider.findAll().subscribe(
      data => this.countries = data
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfileEditModalPage');
  }



  dismiss() {
    let data = this.editProfileForm.value;
    this.viewCtrl.dismiss(data);
  }


  //test select event
  onSelectChange(selectedValue) {
    console.log('Selected');
  }



}
