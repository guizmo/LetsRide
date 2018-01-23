import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class Translate {
  constructor(private translate: TranslateService, private config: Config,) {
    //this.init();
  }

  init(){
    // Set the default language for translation strings, and the current language.
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('en');

    let browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    //this.translate.use('fr');

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  getString(string){
    return this.translate.get(string);
  }
}
