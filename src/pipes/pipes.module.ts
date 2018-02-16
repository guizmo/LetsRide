import { NgModule } from '@angular/core';
import { OrderByPipe } from './order-by/order-by';
import { ReversePipe } from './reverse/reverse';

@NgModule({
    declarations: [
    OrderByPipe,
    ReversePipe,
  ],
  imports: [

  ],
  exports: [
    OrderByPipe,
    ReversePipe
  ]
})
export class PipesModule {}
