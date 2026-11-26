import { User, UserData } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract findByIamId(iamId: string): Promise<User | null>;
  abstract create(data: UserData): Promise<User>;
  abstract update(id: string, changes: Partial<UserData>): Promise<User>;
}
