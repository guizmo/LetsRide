import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers';
import { Profile } from '../../models/profile';
import { Observable } from "rxjs/Rx";

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  editIcon: string = "create";
  editState: boolean = false;

  userProfile: Observable<Profile>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider
  ) {
    console.log('*** Profile Page ****', this);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  etitProfile(){

    if(!this.editState){
      this.editState = true;
      this.editIcon = 'close-circle';
    }else{
      this.editState = false;
      this.editIcon = 'create';
    }

    console.log(this)

  }

}
