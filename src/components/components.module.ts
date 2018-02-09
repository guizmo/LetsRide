import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GmapSearchComponent } from './gmap-search/gmap-search';
import { GbLogoutButton } from './gb-logout-button/gb-logout-button';
import { TranslateModule } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';

export const components = [
  GmapSearchComponent,
  GbLogoutButton
];

@NgModule({
	declarations: [components],
	imports: [
    IonicModule,
    TranslateModule
  ],
	exports: [components]
})
export class ComponentsModule {}
