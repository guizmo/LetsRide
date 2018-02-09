import { NgModule  } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountPage } from './account';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AccountPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(AccountPage),
    TranslateModule.forChild()
  ],
  exports: [
    AccountPage
  ],
})
export class AccountPageModule {}
