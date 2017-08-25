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

    let controls = this.getControls();
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

  arrayToObject(array, keyField){
    return array.reduce((obj, item) => {
      obj[item[keyField]] = item
      return obj
    }, {});
  }


  getControls(){
    let filters = this.arrayToObject(this.navParams.data.filters, 'alias');

    let controls = {
      disciplines: [],
      country: '',
      gender: '',
      city: '',
      level: ''
    }

    Object.keys(controls).map((key, index) => {
      (filters[key]) ? controls[key] = filters[key].value  : ''  ;
    });
    controls.disciplines = [controls.disciplines];
    return controls;

  }

}
