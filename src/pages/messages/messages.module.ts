import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesPage } from './messages';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    MessagesPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesPage),
    TranslateModule.forChild(),
    MomentModule,
    PipesModule
  ],
})
export class MessagesPageModule {}
