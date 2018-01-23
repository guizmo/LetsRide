import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileEditModalPage } from './profile-edit-modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ProfileEditModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileEditModalPage),
    TranslateModule.forChild()
  ],
  exports: [
    ProfileEditModalPage
  ]
})
export class ProfileEditModalPageModule {}
