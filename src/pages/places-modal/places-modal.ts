import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DisciplinesProvider, CountriesProvider } from '../../providers';
import { Discipline, Country } from '../../models';

/**
 * Generated class for the PlacesModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-places-modal',
  templateUrl: 'places-modal.html',
})
export class PlacesModalPage {

  private disciplines: ReadonlyArray<Discipline>;
  private countries: ReadonlyArray<Country>;
  private placeForm: FormGroup;
  private state: string;
  private key: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public disciplinesProvider: DisciplinesProvider,
    public countriesProvider: CountriesProvider
  ) {
    this.placeForm = formBuilder.group({
      name: '',
      country: '',
      city: '',
      lat: '',
      long: ''
    });

    this.state = this.navParams.data.state;
    this.key = this.navParams.data.key;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlacesModalPage', this);
  }

  dismiss() {
    this.viewCtrl.dismiss({state: 'cancel'});
  }

  placeFormSubmit(){
  if (!this.placeForm.valid) {
      //NOT VALID
      return
    } else {
      this.viewCtrl.dismiss({value:this.placeForm.value, state: this.state, key: this.key});
    }
  }


}
