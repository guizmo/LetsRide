import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from "rxjs/Rx";
import { UserProvider } from '../../providers';
import { Profile } from '../../models/profile';


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
export class ProfilePage implements OnInit {

  editIcon: string = "create";
  editState: boolean = false;

  currentUser: Profile;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider
  ) {
    console.log('constructor ProfilePage', this);
    this.userProvider.getProfile().subscribe(
      (data) => {
        this.currentUser = data;
        console.log('data', this.currentUser);
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("completed");
      }
    );
  }

  ngOnInit() {
    console.log('ngOnInit ProfilePage', this.currentUser);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage', this.currentUser);
    console.log(JSON.stringify(this.currentUser))
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
