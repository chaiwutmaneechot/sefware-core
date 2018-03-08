import { Comparison } from '../../purchase/comparison/comparison';

export class User {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  photoURL: string;
  disabled: boolean;
  online: boolean;
  lastOnline: string;

  constructor(params: User) {
    Object.assign(this, params);
  }
}
