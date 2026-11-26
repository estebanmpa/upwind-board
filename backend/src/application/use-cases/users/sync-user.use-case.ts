import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import {
  IamUserProfile,
  UserSyncService,
} from '../../../iam/domain/services/user-sync.service.js';

/** Creates or updates the local mirror of an IAM account on login. */
@Injectable()
export class SyncUserUseCase extends UserSyncService {
  constructor(private readonly users: UserRepository) {
    super();
  }

  async execute(profile: IamUserProfile): Promise<User> {
    const existing = await this.users.findByIamId(profile.id);
    if (!existing) {
      return this.users.create({
        iamId: profile.id,
        email: profile.email,
        name: profile.name,
      });
    }
    if (existing.email === profile.email && existing.name === profile.name) {
      return existing;
    }
    return this.users.update(existing.id, {
      email: profile.email,
      name: profile.name,
    });
  }
}
