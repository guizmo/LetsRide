import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA  } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountPage } from './account';
import { GbLogoutButtonModule } from '../../components/gb-logout-button/gb-logout-button.module';

@NgModule({
  declarations: [
    AccountPage,
  ],
  imports: [
    GbLogoutButtonModule,
    IonicPageModule.forChild(AccountPage),
  ],
  exports: [
    AccountPage
  ],
})
export class AccountPageModule {}
