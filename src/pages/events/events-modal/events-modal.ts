import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Discipline } from '../../../models';
import { PlacesProvider, AlertProvider, UtilsProvider } from '../../../providers';

import * as moment  from 'moment';

@IonicPage()
@Component({
  selector: 'page-events-modal',
  templateUrl: 'events-modal.html',
})
export class EventsModalPage {

  activeMenu = 'EventsPage';
  private placeSelectorState:string = null;
  private eventForm: FormGroup;
  private disciplines: ReadonlyArray<Discipline>;
  public places:any = [];
  public currentYear = moment().format('YYYY');
  public currentDate = moment().format();
  public maxYear = moment().add(1, 'year').format('YYYY');
  public pickerOptions = {
    enableBackdropDismiss:false
  }

  constructor(
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private alertProvider: AlertProvider,
    public translateService: TranslateService,
    public utils: UtilsProvider,
    private placesProvider: PlacesProvider
  ) {
    console.log(this);
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;

    let controls = {
      name: '',
      time: this.currentDate,
      disciplines: '',
      where: '',
      place_id: '',
      private: false
    }
    this.eventForm = formBuilder.group(controls);
    this.places = navParams.data.places;
    this.placeSelector(null);

    if(navParams.data.values){
      this.eventForm.patchValue(navParams.data.values);
    }

  }


  onSave(){
    if (!this.eventForm.valid) {
      //NOT VALID
      return
    } else {
      this.dismiss(this.eventForm.value);
    }
  }

  cancel(){
    this.dismiss({state: 'cancel'});
  }

  dismiss(data:any = null) {
    let values;
    if(data){
      if(!this.placeSelectorState && data.place_id){
        let place = this.getPlace(data.place_id);
        data.where = place.name;
      }
      values = {
        event: data
      }
      if(this.placeSelectorState == 'create'){
        values.create_place = true;
      }
    }else{
      values = data;
    }
    this.viewCtrl.dismiss(values);
  }

  placeSelector(type){
    if(!type && this.places.length == 0){
      this.placeSelectorState = 'create_first_place';
      //this.alertProvider.showErrorMessage('places/none');
    }else{
      this.placeSelectorState = type;
    }
  }


  getPlace(id){
    let result = this.places.filter(p => p.key == id);
    if(result.length){
      result = result[0];
    }else{
      result = null;
    }
    return result;
  }

}
