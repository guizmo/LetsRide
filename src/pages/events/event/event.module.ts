import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventPage } from './event';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    EventPage,
  ],
  imports: [
    IonicPageModule.forChild(EventPage),
    MomentModule,
    PipesModule
  ],
  exports: [
    EventPage
  ]
})
export class EventPageModule {}
