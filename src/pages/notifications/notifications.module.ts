import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationsPage } from './notifications';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationsPage),
    MomentModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  exports: [
    NotificationsPage
  ]
})
export class NotificationsPageModule {}
