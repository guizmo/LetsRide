import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsModalPage } from './events-modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    EventsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(EventsModalPage),
    TranslateModule.forChild(),
  ],
  exports: [
    EventsModalPage
  ]
})
export class EventsModalPageModule {}
