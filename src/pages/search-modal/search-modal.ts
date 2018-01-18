import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DisciplinesProvider, CountriesProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-search-modal',
  templateUrl: 'search-modal.html',
})
export class SearchModalPage {
  private disciplines:ReadonlyArray<any>;
  private countries:ReadonlyArray<any>;
  private searchForm: FormGroup;
  activeMenu = 'SearchModalPage';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public disciplinesPvr: DisciplinesProvider,
    public countriesPvr: CountriesProvider,
    private formBuilder: FormBuilder,
  ) {
    let controls = {
      disciplines: [],
      country: '',
    }
    this.searchForm = formBuilder.group(controls);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchModalPage');
  }

}
