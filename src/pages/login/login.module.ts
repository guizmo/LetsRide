import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    TranslateModule.forChild(),
    IonicPageModule.forChild(LoginPage),
  ],
  exports: [
    LoginPage
  ]
})
export class LoginPageModule {}
