import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsPage } from './events';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  declarations: [
    EventsPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EventsPage),
    MomentModule,
    TranslateModule.forChild(),
    PipesModule,
  ],
  exports: [
    EventsPage
  ]
})
export class EventsPageModule {}
