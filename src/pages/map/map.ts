import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { IonicPage, NavController, LoadingController, NavParams, ViewController } from 'ionic-angular';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import {GoogleMapsAPIWrapper, MapsAPILoader} from '@agm/core';
import {GoogleMap, ZoomControlOptions, MapTypeStyle, ControlPosition} from '@agm/core/services/google-maps-types';
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
  userId?: string;
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
  private userId:string = null;
  private autocompleteItems:Array<any>=[];
  private geocoder;
  private autocompleteService;
  private mapAPI_loaded:boolean = false;
  private loading: any;
  private zoomControlOptions:ZoomControlOptions;
  private mapStyle;

  @ViewChild("search", { read: ElementRef }) searchElementRef;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private spinnerDialog: SpinnerDialog,
    private formBuilder: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public modalNavPage: ModalNavPage,
    public viewCtrl: ViewController
  ) {
    this.setMapStyle();
    //this.spinnerDialog.show('Loading map ...', '', false, {overlayOpacity:0.8});
    // this.searchControlForm = formBuilder.group({
    //   search: '',
    // });
    this.zoomControlOptions = { position: ControlPosition.RIGHT_TOP};
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
    this.setMapAPI();
    //this.autocomplete();


    if(this.navParams.get('values')){
      this.state = 'update';
      let {name, lat, lng } = this.navParams.get('values')
      this.map.lat = lat;
      this.map.lng = lng;
      this.marker.lat = lat;
      this.marker.lng = lng;
      this.marker.name = name;

    }else{
      this.state = this.modalNavPage.navParams.get('state');
      this.setCurrentPosition();
    }
    this.marker.userId = this.modalNavPage.navParams.get('userId');
  }

  presentLoader(message){
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.present();
  }

  setMapAPI(){
    this.mapsAPILoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.mapAPI_loaded = true;
    });
  }

  onCancelSearch(searchbar){
    this.autocompleteItems = [];
  }
  searchAutocomplete(searchbar) {
    // set q to the value of the searchbar
    var q = (searchbar.srcElement != null ) ? searchbar.srcElement.value : searchbar;
    if (!q) {
      return;
    }

    let _self = this;
    this.autocompleteService.getPlacePredictions({ input: q, componentRestrictions: {} }, function (predictions, status) {
      _self.autocompleteItems = [];
      _self.ngZone.run(function () {
        if(predictions)
        predictions.forEach(function (prediction) {
          _self.autocompleteItems.push({description:prediction.description, place_id:prediction.place_id});
        });
      });
    });
  }

  geocodePlaceId(id){
    this.autocompleteItems = [];
    let _self = this;
    this.geocoder.geocode( { 'placeId': id}, function(results, status) {
      if (status == 'OK') {
        let place = results[0];
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        //set latitude, longitude and zoom
        _self.map = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          zoom: 13
        }
        _self.marker = _self.map;
        _self.marker.name = place.name;
        _self.addressToMarker(place.address_components);

      }
    });

  }


  markerDragEnd(m: marker, $event: any) {
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
    this.presentLoader('Searching Location ...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        this.map.lat = lat;
        this.map.lng = lng;
        this.map.zoom = 16;
        this.marker.lat = lat;
        this.marker.lng = lng;

        this.loading.dismiss();
      });
    }else{
      console.log("no geolocation in navigator" );
      this.loading.dismiss();
    }
  }

  getGeoLocation(lat: number, lng: number) {
    //if (navigator.geolocation) {

      let latlng = new google.maps.LatLng(lat, lng);
      let request = { latLng: latlng };


      this.geocoder.geocode(request, (results, status) => {

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

  setMapStyle(){
    this.mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "hue": "#ff4400"
        },
        {
          "saturation": -100
        },
        {
          "lightness": -4
        },
        {
          "gamma": 0.72
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon"
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry",
      "stylers": [
        {
          "hue": "#0077ff"
        },
        {
          "gamma": 3.1
        }
      ]
    },
    {
      "featureType": "water",
      "stylers": [
        {
          "hue": "#00ccff"
        },
        {
          "gamma": 0.44
        },
        {
          "saturation": -33
        }
      ]
    },
    {
      "featureType": "poi.park",
      "stylers": [
        {
          "hue": "#44ff00"
        },
        {
          "saturation": -23
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "hue": "#007fff"
        },
        {
          "gamma": 0.77
        },
        {
          "saturation": 65
        },
        {
          "lightness": 99
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "gamma": 0.11
        },
        {
          "weight": 5.6
        },
        {
          "saturation": 99
        },
        {
          "hue": "#0091ff"
        },
        {
          "lightness": -86
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "lightness": -48
        },
        {
          "hue": "#ff5e00"
        },
        {
          "gamma": 1.2
        },
        {
          "saturation": -23
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "saturation": -64
        },
        {
          "hue": "#ff9100"
        },
        {
          "lightness": 16
        },
        {
          "gamma": 0.47
        },
        {
          "weight": 2.7
        }
      ]
    }
  ];
  }


  /*autocomplete() {
      this.mapsAPILoader.load().then(() => {

        let inputField = this.searchElementRef.nativeElement.querySelector('.searchbar-input');
        let autocomplete = new google.maps.places.Autocomplete( inputField, {
          //types: ['address', 'cities']
        });

        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            //get the place result
            let place = autocomplete.getPlace();
            console.log('autocomplete.addListener', autocomplete);
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
      Geolocation.getCurrentPosition().then((position) => {

          this.map = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              zoom: 15
          };
          this.firstTime = false;
      }, (err) => {
      });

  }*/
}
