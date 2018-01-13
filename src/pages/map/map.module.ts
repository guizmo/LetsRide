import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapPage } from './map';
import { MomentModule } from 'angular2-moment';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    IonicPageModule.forChild(MapPage),
    AgmCoreModule,
    MomentModule
  ],
  exports: [
    MapPage
  ]
})
export class MapPageModule {}
