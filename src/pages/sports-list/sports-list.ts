import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

import { UtilsProvider } from '../../providers';
import { Discipline } from '../../models';

@IonicPage()
@Component({
  selector: 'page-sports-list',
  templateUrl: 'sports-list.html',
})
export class SportsListPage {

  private disciplines: ReadonlyArray<Discipline>;
  private sportsForm;

  constructor(
    private formBuilder: FormBuilder,
    public utils: UtilsProvider,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;
    console.log(this);


    if(navParams.data.values){
      this.sportsForm = navParams.data.values;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SportsListPage');
  }



  onSave(){
    if (!this.sportsForm) {
      //NOT VALID
      return
    } else {
      console.log('onSave', this.sportsForm);
      this.viewCtrl.dismiss(this.sportsForm);
    }
  }

  dismiss() {
    console.log('dismiss');
    this.viewCtrl.dismiss('cancel');
  }

  /*dismiss(data:any = null) {
    let values;
    console.log(data);
    if(data){
      values = {
        discipline: data
      }
    }else{
      values = data;
    }
    //this.viewCtrl.dismiss(values);
  }*/

}
