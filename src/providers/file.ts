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

  openGallery(timestamp, userName) {
    const options: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 100,
      targetHeight: 100
    }

    let fileName = timestamp + '-' + this.sanitizeString(userName) + '.jpg';

    return new Promise<any>( (resolve, reject) => {
      this.camera.getPicture(options).then((imageData) => {
       // imageData is either a base64 encoded string or a file URI
       // If it's base64:
       let base64Image = 'data:image/jpeg;base64,' + imageData;
       this.uploadImage(base64Image, fileName).then((res) => {
         let success = {
           fileName: fileName,
           url: res
         }
         resolve(success);
       }).catch((err) => reject(err) );
      }, (err) => {
       // Handle error
       console.log(err);
       reject(err);
      });
    });
  }



  uploadImage(data, fileName) {

    //let blob = this.dataURItoBlob(data);

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

  delete(fileName){
    let storageRef = this.firebase.storage().ref().child(`/users/${fileName}`);
    console.log('delete(fileName)', storageRef);
    storageRef.delete().then(function() {
      console.log('delete success');
    }).catch(function(error) {
      console.log('delete fail', error);
    });
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


  sanitizeString(str:string){
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/_{2,}/g, '_');
  }

}
