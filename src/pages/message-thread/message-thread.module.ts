import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessageThreadPage } from './message-thread';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { DirectivesModule } from '../../directives/directives.module'

@NgModule({
  declarations: [
    MessageThreadPage,
  ],
  imports: [
    IonicPageModule.forChild(MessageThreadPage),
    MomentModule,
    TranslateModule,
    DirectivesModule
  ],
})
export class MessageThreadPageModule {}
