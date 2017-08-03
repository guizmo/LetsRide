import { Injectable, Inject } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';


@Injectable()
export class FileProvider {

  private firebase:any;
  private storageRef:any;

  constructor(
    @Inject(FirebaseApp) firebaseApp: any,
    private camera: Camera
  ) {
    this.firebase = firebaseApp.firebase_;
    console.log(this);
    console.log(firebase);
  }

  openGallery(fileName) {
    const options: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 100,
      targetHeight: 100
    }

    return new Promise<any>( (resolve, reject) => {
      this.camera.getPicture(options).then((imageData) => {
       // imageData is either a base64 encoded string or a file URI
       // If it's base64:
       let base64Image = 'data:image/jpeg;base64,' + imageData;
       this.uploadImage(base64Image, fileName+'-profil.jpg').then((res) => resolve(res) ).catch((err) => reject(err) )
      }, (err) => {
       // Handle error
       console.log(err);
       reject(err);
      });
    });
  }



  uploadImage(data, fileName) {

    let blob = this.dataURItoBlob(data);

    return new Promise<any>( (resolve, reject) => {

      this.storageRef = this.firebase.storage().ref();
      console.log(this.storageRef);

      let uploadTask = this.storageRef.child(`/users/${fileName}`).putString(data, 'data_url');

      uploadTask.on('state_changed', function(snapshot) {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('progress = ', progress);
        switch (snapshot.state) {
          case 'paused':
            break;
          case 'running':
            break;
        }
      }, function(error) {
        console.log(error);
        reject(error);
      }, function() {
        let downloadURL = uploadTask.snapshot.downloadURL;
        resolve(downloadURL);
      });
    });
  }


  getUrl(fileName){
    let storageRef = this.firebase.storage().ref().child(`/users/${fileName}`);
    storageRef.getDownloadURL().then(url =>
      console.log(url)
    );

  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see stack overflow answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }

   private data = 'data:image/png;base64,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';

}
