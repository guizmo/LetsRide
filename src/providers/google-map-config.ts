import { Injectable } from "@angular/core";
import { LazyMapsAPILoaderConfigLiteral } from "@agm/core";

import { GOOGLEMAPAPIKEY } from '../app/configs';
import { TranslateService } from '@ngx-translate/core';
import { Translate } from './translate';


@Injectable()
export class GoogleMapsConfig implements LazyMapsAPILoaderConfigLiteral {
  public apiKey: string;
  public libraries: Array<string> = [] ;
  public language: string;
  constructor(
    private translate: Translate
  ) {
    this.apiKey = GOOGLEMAPAPIKEY;
    this.libraries = ['places'];
    this.language = this.translate.browserLang;
  }
}
