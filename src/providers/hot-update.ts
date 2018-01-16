import { Injectable, NgZone } from '@angular/core';
import { CodePush, SyncStatus } from '@ionic-native/code-push';
import { LoadingController } from 'ionic-angular';


@Injectable()
export class HotUpdateProvider {

  messageText: string;
  loader = null;

  constructor(
    private ngZone: NgZone,
    private codePush: CodePush,
    public loadingCtrl: LoadingController
  ) {
  }

  init(){
    const downloadProgress = (progress) => {
      let percent = Math.round(progress.receivedBytes/progress.totalBytes*100);
      this.messageText = `Downloading: ${percent}%`;
      this.setLoadingText(this.messageText);
    }
    this.codePush.sync({}, downloadProgress).subscribe((syncStatus) => {
      this.statusUpdate(syncStatus);
    });

  }

  setLoadingText(text:string) {
    const elem = document.querySelector("div.loading-wrapper div.loading-content");
    if(elem) elem.innerHTML = text;
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Checking for update',
    });
    this.loader.present();
  }

  statusUpdate(syncStatus){
    if (syncStatus === SyncStatus.UP_TO_DATE) {

      // facing some zoning problems here !!
      // why ??
      // forcing to run in the ngzone
      /*this.ngZone.run(() => {
        this.messageText = 'App is up to date !';
        //this.events.publish('root:nav-to-home');
      });*/
    }

    // not facing zoning issue here ?
    switch (syncStatus) {
      case SyncStatus.IN_PROGRESS:
        this.messageText = 'An update is in progress';
        break;

      case SyncStatus.CHECKING_FOR_UPDATE:
        this.messageText = 'Checking for update';
        break;

      case SyncStatus.DOWNLOADING_PACKAGE:
        this.presentLoading();
        this.messageText = 'Downloading package';
        break;

      case SyncStatus.INSTALLING_UPDATE:
        this.messageText = 'Installing update';
        break;

      case SyncStatus.UPDATE_INSTALLED:
        this.messageText = 'A new update was installed and will be available on next app restart';
        setTimeout(() => {
          if(this.loader){
            this.loader.dismiss();
          }
        }, 5000);
        /*const alert = this.alertController.create({
          title: 'Update',
          message: 'A new update was installed and will be available on next app restart',
          buttons: ['OK']
        });
        alert.present();
        alert.onDidDismiss(() => {
          this.events.publish('root:nav-to-home');
        });*/
        break;

      case SyncStatus.ERROR:
        this.messageText = 'An error occurred :( ...';
        setTimeout(() => {
          if(this.loader){
            this.loader.dismiss();
          }
        }, 3000);
        break;

      default:
        this.messageText = 'An unhandled sync status ..';
        setTimeout(() => {
          if(this.loader){
            this.loader.dismiss();
          }
        }, 3000);
        break;
    }

    this.setLoadingText(this.messageText);


  }

}
