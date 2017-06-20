import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SignupPage,
  ],
  imports: [
    TranslateModule.forChild(),
    IonicPageModule.forChild(SignupPage),
  ],
  exports: [
    SignupPage
  ]
})
export class SignupPageModule {}
