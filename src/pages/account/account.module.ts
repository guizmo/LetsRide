import { NgModule  } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountPage } from './account';
import { GbLogoutButtonModule } from '../../components/gb-logout-button/gb-logout-button.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AccountPage,
  ],
  imports: [
    GbLogoutButtonModule,
    IonicPageModule.forChild(AccountPage),
    TranslateModule.forChild()
  ],
  exports: [
    AccountPage
  ],
})
export class AccountPageModule {}
