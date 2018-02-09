import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapPage } from './map';
import { MomentModule } from 'angular2-moment';
import { AgmCoreModule } from '@agm/core';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';


@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(MapPage),
    AgmCoreModule,
    TranslateModule.forChild(),
    MomentModule
  ],
  exports: [
    MapPage
  ]
})
export class MapPageModule {}
