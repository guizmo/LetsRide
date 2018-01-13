import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { IonicPage, NavController, LoadingController, NavParams, ViewController } from 'ionic-angular';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

import { MapsAPILoader } from '@agm/core';
import {GoogleMap, ZoomControlOptions, MapTypeStyle, ControlPosition} from '@agm/core/services/google-maps-types';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

import { ModalNavPage } from '../modal-nav/modal-nav';
import { MapStyle } from '../../constants/mapStyle';

import { BuddiesProvider} from '../../providers';

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
  @ViewChild('AgmMap') agmMap;

  public map: any = {};
  public gmap: any ;
  public place: any;
  public event: any;
  pageClass: string = '';
  noLocation:boolean = false;
  searchVisible:boolean = true;
  fullscreen:boolean = true;
  backButton: string = 'Cancel';
  saveButton: string = 'Save';
  buddy:any = null;
  markerDraggable:boolean = true;
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
  private mapStyle = MapStyle;

  @ViewChild("search", { read: ElementRef }) searchElementRef;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private spinnerDialog: SpinnerDialog,
    private formBuilder: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private buddiesProvider: BuddiesProvider,
    private ngZone: NgZone,
    public modalNavPage: ModalNavPage,
    public afdb: AngularFireDatabase,
    public viewCtrl: ViewController,
  ) {
    console.log('MAP',this);
    //this.spinnerDialog.show('Loading map ...', '', false, {overlayOpacity:0.8});
    // this.searchControlForm = formBuilder.group({
    //   search: '',
    // });

    this.zoomControlOptions = { position: ControlPosition.RIGHT_CENTER};
    if(this.modalNavPage.navParams.get('state')){
      this.initMap();
    }
  }

  ionViewWillEnter(){
    this.viewCtrl.setBackButtonText('Cancel')
  }
  ionViewWillLeave(){
    this.modalNavPage.data = this.marker;
  }
  onMapReady(map) {
    this.gmap = map;
  }
  // Load map only after view is initialized
  initMap() {

    this.map.zoom = 15;
    this.setMapAPI();
    //this.autocomplete();

    this.marker.userId = this.modalNavPage.navParams.get('userId');
    this.state = this.modalNavPage.navParams.get('state');
    this.pageClass = this.state;
    if(this.state == 'update' || this.state.includes('display_place') ){
      let {name, lat, lng } = this.modalNavPage.navParams.get('values')
      this.map.lat = lat;
      this.map.lng = lng;
      this.marker.lat = lat;
      this.marker.lng = lng;
      this.marker.name = name;

      this.backButton = (this.state.includes('display_place')) ? 'Back' : 'Cancel';
      this.saveButton = (this.state == 'update') ? 'Done' : 'Save';
    }
    if( this.state == 'display_place_event' ){
      this.fullscreen = false;
      this.event = this.modalNavPage.navParams.get('event');
      this.place = this.modalNavPage.navParams.get('values');
    }
    if( this.state.includes('display') ){
      this.searchVisible = false;
      this.markerDraggable = false;
    }
    if(this.state == 'display_trackers'){
      this.backButton = 'Back';
      this.buddy = this.modalNavPage.navParams.get('buddy');
      this.setCurrentPosition();
      this.afdb.object(`/trackers/${this.buddy.aFuid}`)
        .valueChanges()
        .subscribe((res) => {
          if(res) this.buddy.location = res;
        })
    }
    if( this.state == 'create' ){
      this.setCurrentPosition();
    }else{
      if(!this.map.lat){
        this.noLocation = true;
        this.pageClass = this.state + ' noLocation';
      }
    }

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
    if( this.state.includes('display') ){
      return;
    }
    this.marker.lat = $event.coords.lat;
    this.marker.lng = $event.coords.lng;
  }

  clickedMarker($event: any) {
  }

  mapClicked($event: any) {
    if( this.state.includes('display') ){
      return;
    }
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

        if( !this.state.includes('display_place') ){
          this.marker.lat = lat;
          this.marker.lng = lng;
        }


        if(this.buddy && this.mapAPI_loaded){
          let bounds = new google.maps.LatLngBounds();
          bounds.extend( new google.maps.LatLng(this.marker.lat, this.marker.lng) );
          bounds.extend( new google.maps.LatLng(this.buddy.location.lat, this.buddy.location.lng) );
          this.map.lat = bounds.getCenter().lat();
          this.map.lng = bounds.getCenter().lng();
          this.map.zoom = 12;
        }


        this.loading.dismiss();
      });
    }else{
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
    this.buddiesProvider.eventsParticipantsList = [];
    this.modalNavPage.dismissModal({state: 'cancel'});
  }

  resize(state){
    this.fullscreen = state;
    if(state === true){
      this.pageClass = this.state + ' fullscreen';
    }else{
      this.pageClass = this.state;
    }
    this.agmMap.triggerResize(true);
  }

  updateUrl(event, index) {
    this.buddiesProvider.eventsParticipantsList[index].photoURL = './assets/img/man.svg';
  }

}
