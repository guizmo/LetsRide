import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsModalPage } from './events-modal';

@NgModule({
  declarations: [
    EventsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(EventsModalPage),
  ],
  exports: [
    EventsModalPage
  ]
})
export class EventsModalPageModule {}
