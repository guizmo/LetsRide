import { Injectable } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';

@Injectable()
export class FacebookProvider {

  constructor(
    private fb: Facebook
  ) {

  }

  appInvite(){
    let options = {
      url: "https://fb.me/1936447609944683",
      picture: "http://hwalls.com/upload/bicycles_wallpaper246.jpg"
    }
    this.fb.appInvite(options)
      .then((res) => console.log('Facebook!', res))
      .catch(err => console.log('Error  Facebook', err));
  }


}
