/** Local mirror of an IAM account, kept in sync on every login. */
export class User {
  id: string;
  iamId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: User) {
    Object.assign(this, props);
  }
}

export type UserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
