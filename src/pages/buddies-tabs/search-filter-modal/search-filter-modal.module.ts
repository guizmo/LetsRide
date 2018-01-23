import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchFilterModalPage } from './search-filter-modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SearchFilterModalPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchFilterModalPage),
    TranslateModule.forChild()
  ],
  exports: [
    SearchFilterModalPage
  ]
})
export class SearchFilterModalPageModule {}
