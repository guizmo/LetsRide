import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountEditModalPage } from './account-edit-modal';

@NgModule({
  declarations: [
    AccountEditModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AccountEditModalPage),
  ],
  exports: [
    AccountEditModalPage
  ]
})
export class AccountEditModalPageModule {}
