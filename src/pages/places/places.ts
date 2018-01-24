import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, FabContainer } from 'ionic-angular';

import { UserProvider, PlacesProvider, CaptureProvider, UtilsProvider} from '../../providers';

import { TranslateService } from '@ngx-translate/core';
import { Country } from '../../models';

@IonicPage()
@Component({
  selector: 'page-places',
  templateUrl: 'places.html',
})
export class PlacesPage {
  @ViewChildren('fab') fabs;

  public countries: ReadonlyArray<any>;
  places;
  user;
  images: Array<any>=[];
  showSpinner:boolean = true;
  showNoResult:boolean = false;
  activeMenu = 'PlacesPage';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public userProvider: UserProvider,
    public placesProvider: PlacesProvider,
    public utils: UtilsProvider,
    private capture: CaptureProvider,
    public translateService: TranslateService,
    private alertCtrl: AlertController
  ) {
    (!this.utils.countries) ? this.utils.getCountries().then(res => this.countries = res) : this.countries = this.utils.countries;

    this.userProvider.afAuth.authState.subscribe((user) => {
      if(user){
        this.user = user.toJSON();
        this.placesProvider.getAllByUser(this.user.uid).subscribe((data) => {
          this.places = data;
          this.places.map(place => place.countryName = this.utils.getCountry(place.country, this.countries))
          this.showNoResult = (data.length < 1) ? true : false ;
          this.showSpinner = false;
        });
      }
    });
  }

  ionViewDidLoad() {

  }


  pathForImage(img){
    return this.capture.pathForImage('letsride/'+this.user.uid+'/'+img);
  }


  presentModal(state: string, key: string = null, fab: FabContainer){

    let page = 'PlacesModalPage';
    if(state == 'create' || state == 'display_place'){
      page = 'MapPage';
    }
    let modal = this.modalCtrl.create('ModalNavPage', {
      state: state,
      key: key,
      values: (key) ? this.places.filter( place => place.key === key)[0] : null,
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


  closeFabs(fab: FabContainer){
    this.fabs
      .filter((_fab) => _fab != fab )
      .forEach((_fab:FabContainer) => _fab.close())
  }

}
