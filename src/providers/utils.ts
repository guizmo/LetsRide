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

}
