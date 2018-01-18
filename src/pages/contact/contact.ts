import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
/**
 * Generated class for the ContactPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {
  activeMenu = 'BuddiesTabsPage';

  constructor(private fb: Facebook, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactPage');
  }

  invit(){
    let options = {
      url: "https://fb.me/1936447609944683",
      picture: "http://hwalls.com/upload/bicycles_wallpaper246.jpg"
    }
    this.fb.appInvite(options)
      .then((res) => console.log('Facebook!', res))
      .catch(err => console.log('Error  Facebook', err));
  }

}
