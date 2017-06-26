import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { GbLogoutButton } from './gb-logout-button';
import { LetsRide } from '../../app/app.component';

@NgModule({
  declarations: [
    GbLogoutButton,
  ],
  imports: [
    IonicModule,
    CommonModule
  ],
  exports: [
    GbLogoutButton
  ]
})
export class GbLogoutButtonModule {}
