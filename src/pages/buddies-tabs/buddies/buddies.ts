import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { UserProvider, BuddiesProvider, FacebookProvider, UtilsProvider } from '../../../providers';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';


@IonicPage()
@Component({
  selector: 'page-buddies',
  templateUrl: 'buddies.html',
})
export class BuddiesPage {

  private ngUnsubscribe:Subject<void> = new Subject();
  disciplines: ReadonlyArray<any>;
  countries: ReadonlyArray<any>;
  currentUser;
  avatarDefault = './assets/img/man.svg';
  userData;
  buddiesId:Observable<any[]>;
  buddies: any = [] ;
  showSpinner:boolean = true;
  showNoResult:boolean = false;
  activeMenu = 'BuddiesTabsPage';


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afdb: AngularFireDatabase,
    private buddiesProvider: BuddiesProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    public utils: UtilsProvider,
    private fb: FacebookProvider
  ) {
    //this.navCtrl.parent.select(0);
    (!this.utils.countries) ? this.utils.getCountries().then(res => this.countries = res) : this.countries = this.utils.countries;
    (!this.utils.disciplines) ? this.utils.getDisciplines().then(res => this.disciplines = res) : this.disciplines = this.utils.disciplines;
    this.fetchUserData();
  }

  ionViewDidLeave(){
    //used on tab switch
    this.ionTabLeave();
  }

  ionViewWillUnload(){
    //used on sidemenu switch
    this.ionTabLeave();
  }

  ionTabLeave(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fetchUserData(){
    this.afAuth.authState.takeUntil(this.ngUnsubscribe).subscribe((user) => {
      if(user){
        this.getBuddies(user.uid);
        this.userProvider.getUserData().takeUntil(this.ngUnsubscribe).subscribe((settings) => {
          if(settings){
            this.userData = settings;
            this.currentUser =  user.toJSON();
          }
        });
      }
    });
  }

  showPerson(profile){
    profile.isFriend = true;
    delete profile.providerId;
    this.navCtrl.push('ProfilePage', {userProfile:profile, isAnyProfile:true});
  }

  goto(page){
    this.navCtrl.push(page);
  }
  appInvite(){
    this.fb.appInvite();
  }

  updateUrl(event: Event, index) {
    this.buddies[index].avatar = this.avatarDefault;
  }


  getBuddies(uid:string){
    this.buddiesProvider.getBuddies(uid);
    let notif_user_id;
    if(this.navParams.get('notificationID')){
      notif_user_id = this.navParams.get('additionalData').from.user_id;
    }
    this.buddiesProvider.buddies.takeUntil(this.ngUnsubscribe).subscribe((buddies) => {
      this.showSpinner = false;
      this.showNoResult = (buddies.length < 1) ? true : false ;

      if(this.showNoResult){
        return;
      }

      buddies.map((_buddy) => {
        _buddy = this.utils.buildProfile(_buddy, this.disciplines, this.countries);
        _buddy.isNewBud = 'b_false';
        if(notif_user_id && _buddy.aFuid == notif_user_id){
          _buddy.isNewBud = 'a_true';
        }
        _buddy.sortByName = _buddy.isNewBud+'_'+_buddy.displayName
      });

      this.buddies = buddies;

    })
  }

  removeFriend(clickEvent: Event, index){
    clickEvent.stopPropagation();
    let { aFuid } = this.buddies[index];

    //remove reference to request in currentUser
    this.afdb.object(`/users/${this.userData.aFuid}/buddies/${aFuid}`).remove()
      .then(_ => console.log('success removeFromCurrentUser'))
      .catch(err => console.log(err, 'removeFromCurrentUser error!'));
    //remove reference to request from the ASKER
    this.afdb.object(`/users/${aFuid}/buddies/${this.userData.aFuid}`).remove()
      .then(_ => console.log('success removeFromAsker'))
      .catch(err => console.log(err, 'removeFromAsker error!'));
  }

}
