import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, FabContainer } from 'ionic-angular';


import { UserProvider, AlertProvider, PlacesProvider, CaptureProvider} from '../../providers';

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
  images: Array<any>=[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public userProvider: UserProvider,
    public placesProvider: PlacesProvider,
    private capture: CaptureProvider,
    private alertCtrl: AlertController
  ) {
  }

  ionViewDidLoad() {
    console.log('places', this);
    this.userProvider.afAuth.authState.subscribe((user) => {
      if(user){
        this.user = user.toJSON();
        this.placesProvider.getAllByUser(this.user.uid).subscribe(
            data => this.places = data
        );
      }
    });

  }

  pathForImage(img){
    return this.capture.pathForImage('letsride/'+this.user.uid+'/'+img);
  }


  presentModal(state: string, key: string = null, fab: FabContainer){

    let page = 'PlacesModalPage';
    if(state == 'create'){
      page = 'MapPage';
    }
    let modal = this.modalCtrl.create('ModalNavPage', {
      state: state,
      key: key,
      values: (key) ? this.places.filter( place => place.$key === key)[0] : null,
      page: page,
      userId: this.user.uid
    })

    modal.onDidDismiss(data => {
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
          }


      }
    });


    modal.present();
    if(fab){
      fab.close();
    }
  }

  add(item: any) {
    this.placesProvider.add(item);
  }
  update(key: string, props: any) {
    //props = { name: 'new name' }
    this.placesProvider.update(key, props);
  }
  delete(key: string, fab: FabContainer) {

    let confirm = this.alertCtrl.create({
      title: 'Deleting !',
      message: 'You are going to permanently delete this place !',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            fab.close();
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.placesProvider.delete(key);
          }
        }
      ]
    });
    confirm.present();
  }

  deleteEverything() {
    this.placesProvider.deleteEverything();
  }




}
