import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { Discipline } from '../../../models';
import { DisciplinesProvider } from '../../../providers';

/**
 * Generated class for the EventsModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-events-modal',
  templateUrl: 'events-modal.html',
})
export class EventsModalPage {

  private eventForm: FormGroup;
  private disciplines: ReadonlyArray<Discipline>;
  public date = new Date();
  public currentYear = this.date.getFullYear();
  public currentDate: string = this.date.toISOString();
  public maxYear = this.currentYear + 1;

  constructor(
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public disciplinesProvider: DisciplinesProvider,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    let controls = {
      name: '',
      time: this.currentDate,
      disciplines: '',
      //country: '',
      //city: '',
      // coords: formBuilder.group({
      //   lat: '',
      //   long: ''
      // })
    }
    this.eventForm = formBuilder.group(controls);
    console.log(this);
    if(navParams.data.values){
      this.eventForm.patchValue(navParams.data.values);
    }

  }

  ionViewDidLoad() {
    this.disciplinesProvider.findAll().subscribe(
      data => this.disciplines = data
    );
  }

  onSave(){
    if (!this.eventForm.valid) {
      //NOT VALID
      return
    } else {
      this.dismiss(this.eventForm.value);
    }
  }

  addEvent(){
    let data = {
      time: 'bar',
      coords: {
        lat: -122,
        lng: 166
      },
      country: 'New caledonia',
      city: 'Nouméa',
      type: 'fooBar',
      name: 'Tina'
    }
    this.dismiss({state: 'update', data: data});
  }

  cancel(){
    this.dismiss({state: 'cancel'});
  }

  dismiss(data:any = null) {
    this.viewCtrl.dismiss(data);
  }

}
