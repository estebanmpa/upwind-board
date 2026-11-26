import { User } from '../../../../domain/entities/user.entity.js';
import { UserOrmEntity } from '../entities/user.orm-entity.js';

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    return new User({
      id: entity.id,
      iamId: entity.iamId,
      email: entity.email,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
