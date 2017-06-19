import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core'

@Injectable()
export class Translate {
  constructor(private translate: TranslateService, private config: Config,) {
    this.init();
  }

  init(){
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');

    if (this.translate.getBrowserLang() !== undefined) {
      this.translate.use(this.translate.getBrowserLang());
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  getString(string){
    let translatedString = null;
    this.translate.get(string).subscribe(
      value => {
        translatedString = value;
      }
    )
    return translatedString;
  }
}
