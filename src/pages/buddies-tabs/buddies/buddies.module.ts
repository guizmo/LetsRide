import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuddiesPage } from './buddies';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    BuddiesPage,
  ],
  imports: [
    IonicPageModule.forChild(BuddiesPage),
    PipesModule
  ],
  exports: [
    BuddiesPage
  ]
})
export class BuddiesPageModule {}
