import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlacesModalPage } from './places-modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PlacesModalPage,
  ],
  imports: [
    IonicPageModule.forChild(PlacesModalPage),
    TranslateModule.forChild()
  ],
  exports: [
    PlacesModalPage
  ]
})
export class PlacesModalPageModule {}
