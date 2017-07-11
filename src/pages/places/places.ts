import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';


import { UserProvider, AlertProvider, PlacesProvider} from '../../providers';

/**
 * Generated class for the PlacesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-places',
  templateUrl: 'places.html',
})
export class PlacesPage {

  places;
  user;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public userProvider: UserProvider,
    public placesProvider: PlacesProvider
  ) {
    console.log('constructor PlacesPage');

  }

  ionViewDidLoad() {
    this.userProvider.afAuth.authState.subscribe((user) => {
      if(user){
        this.user = user.toJSON();
        this.placesProvider.getAllByUser(this.user.uid).subscribe(
            data => this.places = data
        );
      }
    });

    console.log(this)
    console.log('ionViewDidLoad PlacesPage');
  }


  presentModal(state: string, key: string = null){
    let modal = this.modalCtrl.create('PlacesModalPage', {
      state: state,
      key: key
    })
    modal.present();
    modal.onDidDismiss(data => {
      console.log(data)
      if(data != null && data.state != 'cancel'){

          switch(data.state) {
            case "create": {
              this.add({...data.value, ...{userId: this.user.uid}})
              break;
            }
            case "update": {
              this.update(data.key, data.value)
              break;
            }
            default: {
              console.log("canceled");
              break;
            }
          }


      }
    })

  }

  add(item: any) {
    this.placesProvider.add(item);
  }
  update(key: string, props: any) {
    //props = { name: 'new name' }
    this.placesProvider.update(key, props);
  }
  delete(key: string) {
    this.placesProvider.delete(key);
  }
  deleteEverything() {
    this.placesProvider.deleteEverything();
  }




}
