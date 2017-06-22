import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DisciplinesService } from '../../providers';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

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

  disciplines: null;

  editProfileForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public disciplinesService: DisciplinesService
  ) {
    console.log(this)

    this.editProfileForm = formBuilder.group({
      disciplines: '',
      email: ['', Validators.compose([Validators.required, Validators.email])],
      displayName: ['', Validators.compose([Validators.required])]
    });


  }

  ngOnInit() {
    this.disciplinesService.findAll().subscribe(
      data => this.disciplines = data
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfileEditModalPage');
  }



  dismiss() {
    let data = { 'foo': 'bar' };
    this.viewCtrl.dismiss(data);
  }


  //test select event
  onSelectChange(selectedValue) {
    console.log('Selected', selectedValue);
  }

}
