import { Injectable, Inject } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from "rxjs/Rx";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class FileProvider {

  private firebase:any;
  private storageRef:any;
  private uploadPercent: Observable<number>;
  private downloadURL: Observable<string>;
  ngUnsubscribe:Subject<void> = new Subject();

  constructor(
    private camera: Camera,
    private storage: AngularFireStorage
  ) {
  }

  openGallery(timestamp, user) {
    const options: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 100,
      targetHeight: 100
    }

    const uid = user.aFuid;

    //let fileName = timestamp + '-' + this.sanitizeString(userName) + '.jpg';
    //let fileName = uid+'/profile.jpg';
    let fileName = 'profile.jpg';
    return new Promise<any>( (resolve, reject) => {
      this.camera.getPicture(options).then((imageData) => {
       // imageData is either a base64 encoded string or a file URI
       // If it's base64:
       let base64Image = 'data:image/jpeg;base64,' + imageData;
       this.uploadImage(base64Image, fileName, uid).then((res) => {
         resolve({
           fileName: fileName,
           url: res
         });
       }).catch((err) => reject(err) );
      }, (err) => {
       // Handle error
       console.log(err);
       reject(err);
      });
    });
  }




  uploadImage(base64Image, fileName, uid) {
    const ref = this.storage.ref(`/users/${uid}/${fileName}`);
    const uploadTask = ref.putString(base64Image, 'data_url');
    //const uploadTask = this.storage.upload(`/users/${filePath}`, data);


    return new Promise<any>( (resolve, reject) => {
      // observe percentage changes
      uploadTask.percentageChanges().takeUntil(this.ngUnsubscribe).subscribe(res => {
        let progress = res/100;
        console.log('uploadPercent', progress.toFixed(0) );
      }, err => {
        reject(err);
        console.log(err);
      })

      // get notified when the download URL is available
      uploadTask.downloadURL().takeUntil(this.ngUnsubscribe).subscribe(res => {
        console.log('downloadURL', res)
        resolve(res);
      }, err => {
        reject(err);
        console.log(err);
      })

      //let uploadTask = this.storageRef.child(`/users/${fileName}`).putString(data, 'data_url');

      /*uploadTask.on('state_changed', function(snapshot) {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log('progress = ', progress);
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
      });*/
    });
  }



  getUrl(uid, fileName){
    const storageRef = this.storage.ref(`/users/${uid}/${fileName}`);
    storageRef.getDownloadURL().takeUntil(this.ngUnsubscribe).subscribe(res => {
      console.log('downloadURL', res)
    }, err => {
      console.log(err);
    })

  }

  delete(uid, fileName){
    const storageRef = this.storage.ref(`/users/${uid}/${fileName}`);

    console.log('delete(fileName)', storageRef);
    storageRef.delete().takeUntil(this.ngUnsubscribe).subscribe(res => {
      console.log('delete success');
    }, err => {
      console.log('delete fail', err);
    })
  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
  }


  sanitizeString(str:string){
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/_{2,}/g, '_');
  }

}
