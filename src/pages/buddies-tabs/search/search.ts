import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

import {
  UserProvider,
  NotificationsProvider,
  PeopleProvider,
  StringManipulationProvider,
  PlacesProvider,
  UtilsProvider
} from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';



@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  activeMenu = 'BuddiesTabsPage';
  translatedString:any = {};
  currentUser;
  userData;
  filterSearch:boolean = false;
  nameSearch:string;
  people:any = [];
  peopleArr:any = null;
  startAt = new Subject() ;
  endAt = new Subject() ;
  isSearching = false;
  showNoResult = false;
  filters:any = [];
  private ngUnsubscribe: Subject = new Subject();
  public disciplines: ReadonlyArray<any>;
  public countries: ReadonlyArray<any>;

  constructor(
    public translateService: TranslateService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public userProvider: UserProvider,
    public placesProvider: PlacesProvider,
    public modalCtrl: ModalController,
    private notifications: NotificationsProvider,
    private peoplePrv: PeopleProvider,
    private strManip: StringManipulationProvider,
    public utils: UtilsProvider,
  ) {
    (!this.utils.countries) ? this.utils.getCountries().then(res => this.countries = res) : this.countries = this.utils.countries;
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;
    this.fetchUserData();
    this.translateService.get(['SEARCH_PAGE']).takeUntil(this.ngUnsubscribe).subscribe((values) => {
      this.translatedString.FILTER_GENDER = values.SEARCH_PAGE.FILTER_GENDER;
    });
  }

  ionViewDidLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fetchUserData(){
    this.afAuth.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      if(user){
        this.userProvider.getUserData().takeUntil(this.ngUnsubscribe).subscribe((settings) => {
          if(settings){
            //this.userLoaded = true;
            this.userData = settings;
            this.currentUser = user.toJSON();
            this.getPeople();
          }
        });
      }
    });
  }

  getPeople(){
    this.peoplePrv.getPeople().takeUntil(this.ngUnsubscribe).subscribe(people => {
        if(people.length){
          people.map((person:any) => {
            person = this.utils.buildProfile(person, this.disciplines, this.countries, null, this.currentUser.uid);
            person.avatarLoaded = true;
            person.iconName = null;

              if(person.isFriendPending === true){
                person.iconName = 'checkmark';
              }else if(person.isFriend) {
                person.iconName = 'contacts';
              }

          });
        }else{
          if(this.isSearching){
            this.showNoResult = true;
          }
        }
        this.isSearching = false;
        this.peopleArr = people.filter((person:any) => person.aFuid != this.currentUser.uid );
      })
  }

  avatarLoaded(index){
    this.people[index].avatarLoaded = true;
  }


  showOptions(){
    let modal = this.modalCtrl.create('SearchFilterModalPage', {filters: this.filters} );

    modal.onDidDismiss(filters => {
      if(filters != null && filters != 'cancel' && Object.keys(filters).length > 0){
        this.filters = Object.keys(filters).map((key, index) => {
          let obj = {
            value: filters[key],
            alias: key
          };
          return (filters[key] != '') ? obj : null ;
        }).filter((filter) => {
          return filter;
        });
        this.applySearchFilter();
      }
    });

    modal.present();

  }



  removeFilter(index, indexDiscipline = null){
    if(indexDiscipline !== null){
      this.filters[index].value.splice(indexDiscipline, 1);
      if(this.filters[index].value.length === 0){
        this.filters.splice(index, 1);
      }
    }else{
      this.filters.splice(index, 1);
    }

    this.applySearchFilter();
  }

  showPerson(profile){
    //profile.isFriend = true;
    delete profile.providerId;
    this.navCtrl.push('ProfilePage', {userProfile:profile, isAnyProfile:true});
  }

  sendFriendRequest(clickEvent: Event, index){
    clickEvent.stopPropagation();
    this.people[index].iconName = 'checkmark';
    let person = this.people[index];
    let key = person.aFuid;
    let oneSignalId = person.oneSignalId;
    let name = person.settings.displayName;

    let contents = {
      'en': `${this.userData.displayName} sent you a friend request!`
    }

    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: this.userData.oneSignalId || null,
        user_id: this.userData.aFuid,
        pending: true,
      },
      displayName: name
    };


    this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);

    if(this.userData.oneSignalId && oneSignalId){
      this.notifications.sendMessage([oneSignalId], data, contents);
    }

  }


  applySearchFilter($event = null){
    let q;
    //this.isSearching = true;
    if($event){
      q = $event.target.value;

      if (this.filters.filter(f => f.alias == 'displayName').length > 0) {
        if(!q){
          this.filters = this.filters.filter(f => f.alias != 'displayName');
        }else{
          this.filters.map((filter) => {
            if(filter.alias == 'displayName'){
              filter.value = q;
            }
          });
        }

      }else{
        this.filters.push({
          value: q,
          alias: 'displayName'
        })
      }
    }

    let filtersSize = this.filters.length;

    if(filtersSize === 0){
      this.people = [];
      //this.isSearching = false;
      this.showNoResult = false;
      return;
    }

    this.filterSearch = true;

    let disciplines = this.filters.filter((_filter) => {
      return _filter.alias == 'disciplines' ;
    });

    let scoreToMatch = (disciplines.length) ? filtersSize - 1 + disciplines[0].value.length : filtersSize;

    this.people = this.peopleArr.map((person) => {
        person.score = 0;
        let settings = person.settings;
        let sports = person.disciplines;

        this.filters.map((_filter) => {
          _filter.label = _filter.value;
          if(_filter.alias == 'displayName'){
            if(_filter.value) {
              let q = _filter.value;
              let displayName = this.strManip.toLatineLowerCase(person.settings.displayName);
              if (displayName.indexOf(this.strManip.toLatineLowerCase(q)) > -1) {
                person.score++;
              }
            }

          }else if(_filter.alias == 'disciplines' ){
            if(settings[_filter.alias].length){
              let disciplinesFilters = _filter.value;
              let res  = sports.reduce((r, a) => disciplinesFilters.includes(a) && r.concat(a) || r, []);
              if(disciplinesFilters.length === res.length){
                person.score = person.score + disciplinesFilters.length;
              }
            }

          }else if(_filter.alias == 'city' ){
            let city = this.strManip.toLatineLowerCase(settings[_filter.alias]);
            if(city.indexOf(this.strManip.toLatineLowerCase(_filter.value)) > -1){
              person.score++;
            }
          }else if(_filter.alias == 'gender' ){
            _filter.label = this.translatedString.FILTER_GENDER[_filter.value];
            if(settings[_filter.alias] == _filter.value){
              person.score++;
            }
          }else{
            if(settings[_filter.alias] == _filter.value){
              person.score++;
            }
          }
        });
        return person;
      }).filter((people) => people.score == scoreToMatch);


    if(this.people.length===0){
      this.showNoResult = true;
    }
  }


}
