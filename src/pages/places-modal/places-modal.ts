import { ModalNavPage } from '../modal-nav/modal-nav';

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DisciplinesProvider, CountriesProvider } from '../../providers';
import { Discipline, Country } from '../../models';


interface place {
  lat?: number;
  lng?: number;
  disciplines?: any;
  name?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

@IonicPage()
@Component({
  selector: 'page-places-modal',
  templateUrl: 'places-modal.html',
})
export class PlacesModalPage {

  private disciplines: ReadonlyArray<Discipline>;
  private countries: ReadonlyArray<Country>;
  private placeForm: FormGroup;
  private modalNavParams: any;
  public state: string = '';

  public place: place = {};
  //public place: any;

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    public disciplinesProvider: DisciplinesProvider,
    public countriesProvider: CountriesProvider,
    public modalNavPage: ModalNavPage,
    public navParams: NavParams
  ) {
    console.log(this);
    this.modalNavParams = this.modalNavPage.navParams;
    this.state = this.modalNavParams.get('state');
    if(this.modalNavParams.get('values') || this.navParams.get('values')){
      let values = this.modalNavParams.get('values') || this.navParams.get('values');
      let {name ,disciplines ,country ,city ,lat ,lng } = values;
      this.place = {name ,disciplines:[disciplines] ,country ,city ,lat ,lng };
    }else{
      this.place = {name:'',disciplines:'',country:'',city:'',lat:null,lng:null};
    }
    this.placeForm = formBuilder.group(this.place);
  }

  ionViewWillEnter(){
    if(this.modalNavPage.data){
      this.placeForm.controls['lat'].setValue(this.modalNavPage.data.lat) ;
      this.placeForm.controls['lng'].setValue(this.modalNavPage.data.lng) ;

      /*if(this.modalNavParams.get('state') == 'create'){
        this.placeForm.controls['city'].setValue(this.modalNavPage.data.city) ;
        this.placeForm.controls['country'].setValue(this.modalNavPage.data.country) ;
        this.placeForm.controls['name'].setValue(this.modalNavPage.data.label) ;
      }*/
    }
  }

  ionViewDidLoad() {
    this.disciplinesProvider.findAll().subscribe(
      data => this.disciplines = data
    );
    this.countriesProvider.findAll().subscribe(
      data => this.countries = data
    );
  }

  dismiss() {
    this.modalNavPage.dismissModal({state: 'cancel'});
  }

  placeFormSubmit(){
  if (!this.placeForm.valid) {
      //NOT VALID
      return
    } else {
      this.modalNavPage.dismissModal({value:this.placeForm.value, state: this.modalNavParams.get('state'), key: this.modalNavParams.get('key')});
    }
  }

  setGeolocation() {
    this.navCtrl.push('MapPage', { values: this.place });
  }

}
