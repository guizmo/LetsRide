import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePage } from './profile';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    ProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
    TranslateModule.forChild(),
    MomentModule
  ],
  exports: [
    ProfilePage
  ]
})
export class ProfilePageModule {}
