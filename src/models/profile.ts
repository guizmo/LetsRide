export interface Discipline {
  [index:number]:string;
}

export interface BuddiesArray {
  [index:number]:string;
}

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
  buddies?: BuddiesArray
}
