import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

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

  disciplines:ReadonlyArray<any>;
  countries:ReadonlyArray<any>;
  private searchForm: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    public disciplinesPvr: DisciplinesProvider,
    public countriesPvr: CountriesProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public userProvider: UserProvider,
    private notifications: NotificationsProvider,
    private peoplePvr: PeopleProvider
  ) {
    console.log(this);
    this.disciplinesPvr.findAll().subscribe(
      data => this.disciplines = data
    );
    this.countriesPvr.findAll().subscribe(
      data => this.countries = data
    );
    let controls = {
      disciplines: [],
      country: '',
    }
    this.searchForm = formBuilder.group(controls);
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

  }

  onCancel(searchbar) {
    this.people = [];
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


}
