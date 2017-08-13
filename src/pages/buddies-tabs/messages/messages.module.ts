import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesPage } from './messages';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    MessagesPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesPage),
    MomentModule,
    PipesModule
  ],
  exports: [
    MessagesPage
  ]
})
export class MessagesPageModule {}
