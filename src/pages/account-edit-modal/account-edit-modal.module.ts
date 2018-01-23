import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountEditModalPage } from './account-edit-modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AccountEditModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AccountEditModalPage),
    TranslateModule.forChild()
  ],
  exports: [
    AccountEditModalPage
  ]
})
export class AccountEditModalPageModule {}
