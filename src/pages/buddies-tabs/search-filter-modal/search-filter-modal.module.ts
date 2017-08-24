import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchFilterModalPage } from './search-filter-modal';

@NgModule({
  declarations: [
    SearchFilterModalPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchFilterModalPage),
  ],
  exports: [
    SearchFilterModalPage
  ]
})
export class SearchFilterModalPageModule {}
