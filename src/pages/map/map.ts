import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import {GoogleMapsAPIWrapper, MapsAPILoader} from '@agm/core';
// import { AgmMap, AgmMarker } from '@agm/core';
import { ModalNavPage } from '../modal-nav/modal-nav';

declare var window: any;
declare var google:any;
/**
 * Generated class for the MapPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
interface marker {
  lat?: number;
  lng?: number;
  name?: string;
  draggable?: boolean;
  city?: string;
  country?: string;
  postal_code?: string;
}

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

  public map: any = {};
  private searchControlForm: FormGroup;
  public state: string;
  public marker: marker = {};

  @ViewChild("search", { read: ElementRef }) searchElementRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private spinnerDialog: SpinnerDialog,
    private formBuilder: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public modalNavPage: ModalNavPage,
    public viewCtrl: ViewController
  ) {
    //this.spinnerDialog.show('Loading map ...', '', false, {overlayOpacity:0.8});
    this.searchControlForm = formBuilder.group({
      search: '',
    });
    //console.log('map', this.navCtrl);
    console.log(this);
  }
  ionViewWillEnter(){
    this.viewCtrl.setBackButtonText('Cancel')
  }
  ionViewWillLeave(){
    this.modalNavPage.data = this.marker;
  }
  // Load map only after view is initialized
  ionViewDidLoad() {

    this.map.zoom = 15;
    this.autocomplete();

    if(this.navParams.get('values')){
      this.state = 'update';
      let {name, lat, lng } = this.navParams.get('values')
      this.marker.lat = this.map.lat = lat;
      this.marker.lng = this.map.lng = lng;
      this.marker.name = name;
    }else{
      this.state = this.modalNavPage.navParams.get('state');
      this.setCurrentPosition();
    }

  }

  autocomplete() {
      this.mapsAPILoader.load().then(() => {
        let inputField = this.searchElementRef.nativeElement.getElementsByTagName('input')[0];
        let autocomplete = new google.maps.places.Autocomplete( inputField, {
          //types: ['address', 'cities']
        });

        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            //get the place result
            let place = autocomplete.getPlace();
            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }

            //set latitude, longitude and zoom
            this.map = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              zoom: 16
            }

            this.marker.lat = place.geometry.location.lat();
            this.marker.lng = place.geometry.location.lng();
            this.marker.name = place.name;
            this.addressToMarker(place.address_components);

          });
        });
      });
  }
  loadMap(){
    //native
      /*Geolocation.getCurrentPosition().then((position) => {

          this.map = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              zoom: 15
          };
          this.firstTime = false;
      }, (err) => {
      });*/

  }

  markerDragEnd(m: marker, $event: any) {
    //console.log('dragEnd', m, $event);
    this.marker.lat = $event.coords.lat;
    this.marker.lng = $event.coords.lng;
  }

  clickedMarker($event: any) {
  }

  mapClicked($event: any) {
    this.marker.lat = $event.coords.lat;
    this.marker.lng = $event.coords.lng;
    this.getGeoLocation(this.marker.lat, this.marker.lng);
  }

  getDirections() {
    //window.location = `geo:${this.map.lat},${this.map.lng};u=35`;
  }


  setCurrentPosition() {
    //console.log('setCurrentPosition');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        //console.log('getCurrentPosition');
        this.map.lat = position.coords.latitude;
        this.map.lng = position.coords.longitude;
        this.map.zoom = 16;
      });
    }
  }

  getGeoLocation(lat: number, lng: number) {
    //if (navigator.geolocation) {
      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(lat, lng);
      let request = { latLng: latlng };


      geocoder.geocode(request, (results, status) => {

        if (status == google.maps.GeocoderStatus.OK) {
          let result = results[0];

          this.marker.postal_code = '';
          this.marker.city = '';
          this.marker.country= '';
          if (result) {
            this.addressToMarker(result.address_components);
          } else {
            alert("No address available!");
          }
        }
      });
    //}
  }

  onSave(){
    if(this.state == 'update'){
      this.navCtrl.pop();
    }else if(this.state == 'create'){
      this.navCtrl.push('PlacesModalPage', { values: this.marker });
    }
  }

  addressToMarker(data){
    for (let i = 0; i < data.length; i++) {
      let component = data[i];
      if (component.types[0] == 'country') {
        this.marker.country = component.long_name;
      }

      if (component.types[0] == 'locality') {
        this.marker.city = component.long_name;
      }

      if(component.types[0] == "postal_code"){
        this.marker.postal_code = component.long_name;
      }
    }

  }

  dismiss(){
    this.modalNavPage.dismissModal({state: 'cancel'});
  }
}
