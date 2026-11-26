export interface IamUserProfile {
  id: string;
  email: string;
  name: string;
}

export interface SyncedUser {
  id: string;
  iamId: string;
}

// Port implemented by the host app so it can mirror IAM users locally
// without the IAM module depending on the app's own user model.
export abstract class UserSyncService {
  abstract execute(profile: IamUserProfile): Promise<SyncedUser>;
}
