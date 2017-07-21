import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuddiesTabsPage } from './buddies-tabs';
//import { SearchPage } from './search/search';

@NgModule({
  declarations: [
    BuddiesTabsPage,
    //SearchPage,
  ],
  imports: [
    IonicPageModule.forChild(BuddiesTabsPage),
  ]
})
export class BuddiesTabsPageModule {}
