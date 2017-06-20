import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GbLogoutButton } from './gb-logout-button';
import { LetsRide } from '../../app/app.component';

@NgModule({
  declarations: [
    GbLogoutButton,
  ],
  imports: [
    IonicModule.forRoot(LetsRide)
  ],
  exports: [
    GbLogoutButton
  ]
})
export class GbLogoutButtonModule {}
