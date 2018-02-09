import { Component, Injectable, Output, Input, NgZone, EventEmitter } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { TranslateService } from '@ngx-translate/core';

declare var google:any;


@Component({
  selector: 'gmap-search',
  templateUrl: 'gmap-search.html'
})
export class GmapSearchComponent {

  @Input('isTransparent') isTransparent ;
  @Output() onLocationFound = new EventEmitter();
  @Output() onMapApiLoaded = new EventEmitter();
  currentLang;
  private autocompleteService;
  private geocoder;
  private mapAPI_loaded = false;
  private autocompleteItems:Array<any>=[];

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang;
    this.setMapAPI();
    console.log('Hello GmapSearchComponent', this);
  }



  setMapAPI(){
    this.mapsAPILoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.mapAPI_loaded = true;
      this.onMapApiLoaded.emit();
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

    this.autocompleteService.getPlacePredictions({ input: q, componentRestrictions: {} }, (predictions, status) => {
      this.autocompleteItems = [];
      this.ngZone.run(() => {
        if(predictions)
        predictions.forEach( (prediction) => {
          this.autocompleteItems.push({description:prediction.description, place_id:prediction.place_id});
        });
      });
    });
  }

  geocodePlaceId(id){
    this.autocompleteItems = [];
    this.geocoder.geocode( { 'placeId': id}, (results, status) => {

      this.onLocationFound.emit(results);
      /*if (status == 'OK') {
        let place = results[0];
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        //set latitude, longitude and zoom
        this.map = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          zoom: 13
        }
        _self.marker = _self.map;
        _self.marker.name = place.name;
        _self.addressToMarker(place.address_components);

      }
      */
    });

  }
}
