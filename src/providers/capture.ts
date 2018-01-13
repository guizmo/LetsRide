import { Injectable } from '@angular/core';
import { ActionSheetController, ToastController, Platform, LoadingController, Loading, normalizeURL } from 'ionic-angular';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';

declare var cordova: any;

/*
  Generated class for the CaptureProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class CaptureProvider {

  public imageName = new BehaviorSubject<any>(null);
  public userKey: string = null;
  //private loading: Loading;


  constructor(
    private camera: Camera,
    private file: File,
    private filePath: FilePath,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public loadingCtrl: LoadingController
  ) {
    //console.log('capture provider',this);
    this.createLetsrideDir();
  }


  public presentActionSheet() {
    //let actionSheet = this.actionSheetCtrl.create({
    return this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Select from library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.imageName.next('CANCEL');
            this.imageName.complete();
          }
        }
      ]
    });
    //actionSheet.present();
  }



  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.checkCustomDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.checkCustomDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
      this.imageName.next('ERROR: selecting image');
      this.imageName.complete();
    });
  }


  // Create a new name for the image
  private createFileName() {
    var d = new Date(),
    n = d.getTime(),
    newFileName =  n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private checkCustomDir(namePath, currentName, newFileName) {
    let customDir = 'letsride/' + this.userKey;
    let dest = cordova.file.dataDirectory + customDir;
    this.file.checkDir(this.file.dataDirectory, customDir).then( _ => {
      this.copyFileToCustomDir(namePath, currentName, dest, newFileName);
    })
    .catch(err => {
      this.imageName.next('Directory doesnt exist');
      this.file.createDir(this.file.dataDirectory, customDir, false).then( dir => {
        this.copyFileToCustomDir(namePath, currentName, dest, newFileName);
      }).catch(err => {
        this.imageName.next('ERROR: createDir');
        this.imageName.complete();
      });
    });

  }

  private copyFileToCustomDir(namePath, currentName, dest, newFileName) {
    this.file.copyFile(namePath, currentName, dest, newFileName).then(success => {
      //this.imageName = newFileName;
      this.imageName.next(newFileName);
      this.imageName.complete();
    }, error => {
      this.presentToast('Error while storing file.');
      this.imageName.next('ERROR: storing file');
      this.imageName.complete();
    });
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  private createLetsrideDir(){
    this.file.checkDir(this.file.dataDirectory, 'letsride').then( _ => {
    })
    .catch(err => {
      this.file.createDir(this.file.dataDirectory, 'letsride', false).then( dir => {
      }).catch(err => {
        //console.log(err);
      });
    });

  }

  // Always get the accurate path to your apps folder
  public pathForImage(imgPath) {
    if (imgPath === null || typeof(cordova) == 'undefined') {
      return '';
    } else {
      return normalizeURL(cordova.file.dataDirectory) + imgPath;
    }
  }

}
