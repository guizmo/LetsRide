import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DisciplinesProvider, CountriesProvider } from '../../../providers';

@IonicPage()
@Component({
  selector: 'page-search-filter-modal',
  templateUrl: 'search-filter-modal.html',
})
export class SearchFilterModalPage {
  private searchForm: FormGroup;
  disciplines:ReadonlyArray<any>;
  countries:ReadonlyArray<any>;

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public disciplinesPvr: DisciplinesProvider,
    public countriesPvr: CountriesProvider,
  ) {
    console.log(this);
    this.disciplinesPvr.findAll().subscribe(data => this.disciplines = data);
    this.countriesPvr.findAll().subscribe(data => this.countries = data);

    const emptyValues = {
      disciplines: '',
      country: '',
      gender: '',
      city: '',
      level: ''
    }

    let filters = this.navParams.data.filters != null ? this.navParams.data.filters : emptyValues;
    let { disciplines = '', country = '', gender = '', city = '', level = '' } = filters;

    let controls = {
      disciplines: [disciplines],
      country: country,
      gender: gender,
      city: city,
      level: level
    }

    this.searchForm = formBuilder.group(controls);
  }

  searchFormSubmit(){
    if (!this.searchForm.valid) {
      //NOT VALID
      return
    } else {
      this.viewCtrl.dismiss(this.searchForm.value);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss('cancel');
  }

}
