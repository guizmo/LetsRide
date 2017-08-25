import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ModalController } from 'ionic-angular';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject'

import { UserProvider, NotificationsProvider, PeopleProvider, DisciplinesProvider, CountriesProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';



@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  currentUser;
  userData;
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
    private peoplePvr: PeopleProvider
  ) {
    console.log(this);

    //this.filters = [{"value":["Cross Country (XC)", "Downhill", "Enduro", "Road", "All-mountain"],"alias":"disciplines"},{"value":"New Caledonia","alias":"country"},{"value":"Male","alias":"gender"},{"value":"Nouméa","alias":"city"},{"value":3,"alias":"level"}];
  }

  ionViewDidLoad() {
    //this.peoplePvr.getPeople(this.startAt, this.endAt, 10)
    this.peoplePvr.getPeople()
      .subscribe(people => {
        console.log(people);
        if(people.length){
          people.map((person) => {
            person.avatarLoaded = false;

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
        //this.people = people;
        this.peopleArr = people;



      })
  }

  avatarLoaded(index){
    this.people[index].avatarLoaded = true;
  }

  search($event) {
    let q = $event.target.value;
    if(!q){
      this.people = [];
      this.isSearching = false;
      this.showNoResult = false;
      return;
    }

    this.people = this.peopleArr.filter((v) => {
      if(v.settings.displayName && q) {
        if (v.settings.displayName.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });

    //this.isSearching = true;
    //let q = this.capitalize($event.target.value);
    //this.startAt.next(q);
    //this.endAt.next(q+"\uf8ff");
  }

  ionViewDidEnter() {
    this.getCurrentUser();
  }

  capitalize(s){
    return s[0].toUpperCase() + s.slice(1);
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

  onCancel(searchbar){
    this.people = [];
  }

  removeFilter(index, indexDiscipline = null){
    if(indexDiscipline !== null){
      this.filters[index].value.splice(indexDiscipline, 1);
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
      return;
    }

    this.navParams.data.subscribe(
      values => {
        if(values){
          let key = Object.keys(values)[0];
          for (let key in values) {
            this[key] = values[key];
          }
        }
      },
      error => console.log('error'),
      () => { }
    );
  }


  sendFriendRequest(key, oneSignalId, name){

    let data = {
      type: 'friendRequest',
      from: {
        oneSignalId: this.userData.oneSignalId,
        user_id: this.userData.aFuid,
        pending: true,
      },
      displayName: name
    };

    this.notifications.sendMessage([oneSignalId], data)
      .then((res) => {
        this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);
      })
      .catch((err) => {
        if(err == 'cordova_not_available'){
          this.afdb.list(`/users/${key}/buddies`).update(this.userData.aFuid, data.from);
        }
      })
  }







  applySearchFilter(){

    let filtersSize = this.filters.length;

    if(filtersSize === 0){
      this.people = [];
      return;
    }

    let disciplines = this.filters.filter((_filter) => {
      return _filter.alias == 'disciplines' ;
    });

    let scoreToMatch = (disciplines.length) ? filtersSize - 1 + disciplines[0].value.length : filtersSize;
    this.people = this.peopleArr.map((person) => {
        person.score = 0;
        let settings = person.settings;

        this.filters.map((_filter) => {

          if(_filter.alias == 'disciplines' ){
            if(JSON.stringify(_filter.value) == JSON.stringify(settings[_filter.alias])){
              person.score = person.score + _filter.value.length;
            }
          }else{
            if(settings[_filter.alias] == _filter.value){
              person.score++;
            }
          }
        });
        return person;
      }).filter((people) => people.score == scoreToMatch)



  }


}
