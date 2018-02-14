import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class UtilsProvider {

  public countries: ReadonlyArray<any>;
  public disciplines: ReadonlyArray<any>;
  constructor(
    public translateService: TranslateService
  ) {
  }

  getCountries(){
    return new Promise<any>( (resolve, reject) => {
      this.translateService.get(['COUNTRIES']).subscribe((values) => {
        if (typeof(values.COUNTRIES) == 'object') {
          this.countries = values.COUNTRIES.sort(function(a, b) {
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
          });
          resolve(this.countries);
        }else{
          resolve([]);
        }
      });
    });
  }

  getCountry(code = '', countryList){
    let filteredList;
    let countryName;
    if(code != ''){
      filteredList = countryList.filter(country => code == country.code);
      countryName = filteredList.length ? filteredList[0].name : code;
    }
    return countryName;
  }

  getDisciplines(){
    return new Promise<any>( (resolve, reject) => {
      this.translateService.get(['DISCIPLINES']).subscribe((values) => {
        if (typeof(values.DISCIPLINES) == 'object') {
          this.disciplines = values.DISCIPLINES.sort(function(a, b) {
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
          });
          resolve(this.disciplines);
        }else{
          resolve([]);
        }
      });
    });
  }

  buildProfile(data:any, disciplinesList, countryList, user:any = null, uid:string = null){
    if(data.settings.disciplines){
      let disciplines = [];

      for (let alias of data.settings.disciplines) {
        let discipline = this.getRidingStyle(alias, disciplinesList);
        if(discipline.name){
          disciplines.push(discipline.name);
        }
      }
      data.disciplines = disciplines;
    }


    data.settings.countryName = (data.settings && data.settings.country) ? this.getCountry(data.settings.country, countryList) : '';
    if(user){
      data.displayName = (data.settings && data.settings.displayName) ? data.settings.displayName : user.displayName;
      data.emailVerified = (user.providerData[0].providerId == 'facebook.com') ? true : user.emailVerified;
    }else{
      if(uid){
        data.isFriend = (data.buddies && data.buddies[uid] && !data.buddies[uid].pending) || false;
        if(data.buddies && data.buddies[uid] && data.buddies[uid].pending){
          data.isFriendPending = true;
        }
      }
      data.displayName = data.settings.displayName;
      data.emailVerified = true;
    }

    if(data.profileImg && data.profileImg.url){
      data.profileImgPath = data.profileImg.url;
    }else if(data.photoURL){
      data.profileImgPath = data.photoURL;
    }else{
      data.profileImgPath = './assets/img/man.svg';
    }

    return data;
  }

  getRidingStyle(alias: string, disciplinesList){
    let discipline:any = {
      image: 'default.png'
    };
    if(alias != ''){
      let filtered = disciplinesList.filter( disciplineVal => disciplineVal.alias == alias );
      if(filtered.length){
        discipline = filtered[0];
        discipline.image = filtered[0].alias+'.jpg';
      }
    }
    return discipline;
  }


  getDistanceBetweenPoints(start, end, units){
    let earthRadius = {
        miles: 3958.8,
        km: 6371
    };
    let R = earthRadius[units || 'miles'];
    let lat1 = start.lat;
    let lon1 = start.lng;
    let lat2 = end.lat;
    let lon2 = end.lng;
    let dLat = this.toRad((lat2 - lat1));
    let dLon = this.toRad((lon2 - lon1));
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  }

  toRad(x){
    return x * Math.PI / 180;
  }

}
