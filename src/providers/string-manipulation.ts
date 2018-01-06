import { Injectable } from '@angular/core';
import { LatinisePipe } from 'ngx-pipes';


@Injectable()
export class StringManipulationProvider {

  constructor(
    private latinisePipe: LatinisePipe
  ) { }

  toLatineLowerCase(str: string){
    return this.latinisePipe.transform(str.toLowerCase());
  }

}
