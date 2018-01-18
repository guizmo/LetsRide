import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MockNotifsPage } from './mock-notifs';

@NgModule({
  declarations: [
    MockNotifsPage,
  ],
  imports: [
    IonicPageModule.forChild(MockNotifsPage),
  ],
})
export class MockNotifsPageModule {}
