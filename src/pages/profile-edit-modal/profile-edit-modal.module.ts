import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileEditModalPage } from './profile-edit-modal';

@NgModule({
  declarations: [
    ProfileEditModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileEditModalPage),
  ],
  exports: [
    ProfileEditModalPage
  ]
})
export class ProfileEditModalPageModule {}
