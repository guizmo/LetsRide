import { Injectable } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';

import { Diagnostic } from '@ionic-native/diagnostic';

@Injectable()
export class PermissionsProvider {

  private bgAlertMsg:any = {
    title: 'Background location!',
    message: 'Let\'s Ride needs access to background location to let your friends around know you your position !',
  };



  constructor(
    private diagnostic: Diagnostic,
    public platform: Platform,
    private alertCtrl: AlertController,
  ) {

  }

  request(){
    this.diagnostic.requestLocationAuthorization('always').then((res) => console.log(res))
  }

  isLocationAuthorized(){
    var promise = new Promise<any>((resolve, reject) => {

      //console.log('isLocationAuthorized promise start');

      this.diagnostic.isLocationAuthorized()
        .then((res) => {
          //console.log('isLocationAuthorized', res);
          if(res){
            //console.log('isLocationAuthorized success', res);
            this.diagnostic.getLocationAuthorizationStatus().then((res) => {
              if(res == 'authorized'){
                //console.log('getLocationAuthorizationStatus authorized', res);
                resolve(res);
              }else{
                //console.log('getLocationAuthorizationStatus fail', res);
                reject(res);
              }
            })

          }else{
            //console.error('isLocationAuthorized fail', res);
            reject(res);
          }
        })
        .catch((res) => {
          //console.error('isLocationAuthorized check failed');
          //show alert message maybe
          reject(false);
        })

    });
    return promise;
  }


  showMessage(){
    this.alertCtrl.create({
      title: this.bgAlertMsg.title,
      message: this.bgAlertMsg.message,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Close',
          handler: () => {
            this.diagnostic.switchToSettings()
              .then(() => {
                console.log('switchToSettings then');
              }).catch(() => {
                console.log('switchToSettings catch');
              });
          }
        },
      ]
    }).present();

  }

}
