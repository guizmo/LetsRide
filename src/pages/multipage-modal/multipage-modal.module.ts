import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultipageModalPage } from './multipage-modal';

@NgModule({
  declarations: [
    MultipageModalPage,
  ],
  imports: [
    IonicPageModule.forChild(MultipageModalPage),
  ],
  exports: [
    MultipageModalPage
  ]
})
export class MultipageModalPageModule {}
