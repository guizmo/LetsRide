export interface Profile {
  uid?: string;
  aFuid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  settings?: any;
  providerId?: string;
}
/*   constructor(
    public uid: string,
    public aFuid: string,
    public displayName: string,
    public emailAddress: string,
    public photoURL: string,
    public settings: string,
    public providerId: string
  ){

   this.uid = uid || '';
    this.displayName = json.displayName || '';
    this.photoURL = json.photoURL || '';
    this.providerId = json.providerId || '';
    this.emailAddress = json.emailAddress || '';

  }*/


    /*
  avatarUrl(size: number = 100): string {
    return './assets/images/avatar.png';
  }


  addItem(item){
    this.items.push({
      title: item,
      checked: false
    });
  }

  removeItem(item){
    for(i = 0; i < this.items.length; i++) {
      if(this.items[i] == item){
        this.items.splice(i, 1);
      }
    }
  }

  renameItem(item, title){
    for(i = 0; i < this.items.length; i++) {
      if(this.items[i] == item){
        this.items[i].title = title;
      }
    }
  }



  setTitle(title){
      this.title = title;
  }
  */
