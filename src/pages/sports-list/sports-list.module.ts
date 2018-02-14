import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SportsListPage } from './sports-list';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SportsListPage,
  ],
  imports: [
    IonicPageModule.forChild(SportsListPage),
    TranslateModule.forChild(),
  ],
})
export class SportsListPageModule {}
