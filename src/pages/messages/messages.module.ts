import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesPage } from './messages';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    MessagesPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesPage),
    TranslateModule.forChild(),
    MomentModule
  ],
})
export class MessagesPageModule {}
