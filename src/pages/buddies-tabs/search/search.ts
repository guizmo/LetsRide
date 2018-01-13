import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ModalController } from 'ionic-angular';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject'

import {
  UserProvider,
  NotificationsProvider,
  PeopleProvider,
  DisciplinesProvider,
  CountriesProvider,
  StringManipulationProvider
} from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';



@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  currentUser;
  userData;
  filterSearch:boolean = false;
  nameSearch:string;
  people:any = [];
  peopleArr:any = [];
  startAt = new Subject() ;
  endAt = new Subject() ;
  isSearching = false;
  showNoResult = false;
  filters:any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
    private notifications: NotificationsProvider,
    private peoplePvr: PeopleProvider,
    private strManip: StringManipulationProvider
  ) {
    console.log(this);
    //this.filters = [{"value":["Cross Country (XC)", "Downhill", "Enduro", "Road", "All-mountain"],"alias":"disciplines"},{"value":"New Caledonia","alias":"country"},{"value":"Male","alias":"gender"},{"value":"Nouméa","alias":"city"},{"value":3,"alias":"level"}];
    //this.fetchUserData();
  }
  ionViewDidLoad() {
    this.getCurrentUser();
  }

  fetchUserData(){
    this.afAuth.authState.subscribe((user) => {
      if(user){
        this.getPeople();
        console.log('this.userProvider.userData', this.userProvider.userData);
        this.userProvider.getUserData().subscribe((settings) => {
          console.log('settings', settings);
          if(settings){
            //this.userLoaded = true;
            this.userData = settings;
            this.currentUser =  user.toJSON();
            console.log(this);
          }
        });
      }
    });
  }



  getPeople(){
    console.log('getPeople');
    this.peoplePvr.getPeople()
      .subscribe(people => {
        if(people.length){

          people.map((person) => {
            person.avatarLoaded = false;
            if(person.buddies && person.buddies[this.currentUser.uid]){
              if(person.buddies[this.currentUser.uid].pending){
                person.iconName = 'checkmark';
              }else {
                //if person.requestSent
                person.iconName = 'contacts';
              }
            }else{
              person.iconName = null;
            }

            if(person.profileImg && person.profileImg.url != ''){
              person.avatar = person.profileImg.url;
            }else if(person.photoURL){
              person.avatar = person.photoURL;
            }else{
              person.avatar = './assets/img/man.svg';
              person.avatarLoaded = true;
            }
          })
        }else{

          if(this.isSearching){
            this.showNoResult = true;
          }
        }
        this.isSearching = false;
        people = people.filter((person) => person.aFuid != this.currentUser.uid )
        this.peopleArr = people;
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


  getCurrentUser() {
    if(this.navParams.data.value){
      let values = this.navParams.data.value;
      for (let key in values) {
        this[key] = values[key];
      }
      this.getPeople();
      return;
    }

    /*this.navParams.data.subscribe(
      values => {
        if(values){
          let key = Object.keys(values)[0];
          for (let key in values) {
            this[key] = values[key];
          }
          this.getPeople();
        }
      },
      error => console.log('error'),
      () => { }
    );*/
  }


  sendFriendRequest(index){
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
    let filterArr = [];
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



    console.log('filtersSize', filtersSize);
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

        this.filters.map((_filter) => {
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
              let sports = settings[_filter.alias];
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
