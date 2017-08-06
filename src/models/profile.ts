export interface Discipline {
  [index:number]:string;
}

export interface Buddy {
  user_id: string;
  oneSignalId: string;
  pending: boolean;
}

export interface ProfileImg {
  url: string;
  name: string;
  pending: boolean;
}

interface Buddies extends Array<Buddy>{}

export interface SettingsObject {
  age?: string;
  city?: string;
  country?: string;
  displayName?: string;
  gender?: string;
  level?: number;
  disciplines?: Discipline;
}


export interface Profile {
  uid: string;
  aFuid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  settings?: any;
  providerId?: string;
  oneSignalId?: string;
  profileImg?: ProfileImg;
  buddies?: Buddies
}
