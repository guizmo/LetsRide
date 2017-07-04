import { Injectable } from '@angular/core';
import { LoadingController, Platform } from 'ionic-angular';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';

@Injectable()
export class LoadingProvider {
  // Loading Provider
  // This is the provider class for most of the loading spinners screens on the app.
  // Set your spinner/loading indicator type here
  // List of Spinners: https://ionicframework.com/docs/v2/api/components/spinner/Spinner/
  private spinner = {
    spinner: 'circles'
  };
  private loading;
  private is_cordova: boolean = false;
  constructor(
    public loadingController: LoadingController,
    public platform: Platform,
    public spinnerDialog: SpinnerDialog
  ) {
    this.is_cordova = this.platform.is('cordova');
  }

  //Show loading
  show() {
    if(this.is_cordova){
      this.spinnerDialog.show(null,'Waiting ...',true,{overlayOpacity:0.60});
    }else{
      if (!this.loading) {
        this.loading = this.loadingController.create(this.spinner);
        this.loading.present();
      }
    }
  }

  //Hide loading
  hide() {
    if(this.is_cordova){
      this.spinnerDialog.hide();
    }else{
      if (this.loading) {
        this.loading.dismiss();
        this.loading = null;
      }
    }
  }
}
