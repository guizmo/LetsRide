import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuddiesTabsPage } from './buddies-tabs';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    BuddiesTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(BuddiesTabsPage),
    TranslateModule.forChild()
  ]
})
export class BuddiesTabsPageModule {}
