import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlacesPage } from './places';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PlacesPage,
  ],
  imports: [
    IonicPageModule.forChild(PlacesPage),
    TranslateModule.forChild()
  ],
  exports: [
    PlacesPage
  ]
})
export class PlacesPageModule {}
