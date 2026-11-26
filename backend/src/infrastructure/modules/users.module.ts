import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { UserOrmEntity } from '../persistence/type-orm/entities/user.orm-entity.js';
import { TypeOrmUserRepository } from '../persistence/type-orm/repositories/type-orm-user.repository.js';

/** Global so the IAM module can resolve the user sync use case. */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [{ provide: UserRepository, useClass: TypeOrmUserRepository }],
  exports: [UserRepository],
})
export class UsersModule {}
