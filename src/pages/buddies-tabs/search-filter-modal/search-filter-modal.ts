import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilsProvider } from '../../../providers';


@IonicPage()
@Component({
  selector: 'page-search-filter-modal',
  templateUrl: 'search-filter-modal.html',
})
export class SearchFilterModalPage {
  private searchForm: FormGroup;
  public disciplines: ReadonlyArray<any>;
  public countries: ReadonlyArray<any>;
  activeMenu = 'BuddiesTabsPage';


  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public utils: UtilsProvider,
  ) {
    (!this.utils.countries) ? this.utils.getCountries().then(res => this.countries = res) : this.countries = this.utils.countries;
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;


    let controls = this.getControls();
    this.searchForm = this.formBuilder.group(controls);
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
      countryName: '',
      gender: '',
      city: '',
      displayName: '',
      level: ''
    }

    Object.keys(controls).map((key, index) => {
      (filters[key]) ? controls[key] = filters[key].value  : ''  ;
    });
    controls.disciplines = [controls.disciplines];
    return controls;

  }

}
