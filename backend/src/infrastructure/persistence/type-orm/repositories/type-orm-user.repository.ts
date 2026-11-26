import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserData } from '../../../../domain/entities/user.entity.js';
import { NotFoundError } from '../../../../domain/errors/domain.error.js';
import { UserRepository } from '../../../../domain/repositories/user.repository.js';
import { UserOrmEntity } from '../entities/user.orm-entity.js';
import { UserMapper } from '../mappers/user.mapper.js';
import { withoutUndefined } from './without-undefined.js';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findByIamId(iamId: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ iamId });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async create(data: UserData): Promise<User> {
    const entity = await this.repository.save(this.repository.create(data));
    return UserMapper.toDomain(entity);
  }

  async update(id: string, changes: Partial<UserData>): Promise<User> {
    await this.repository.update({ id }, withoutUndefined(changes));
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundError('User', id);
    return UserMapper.toDomain(entity);
  }
}
