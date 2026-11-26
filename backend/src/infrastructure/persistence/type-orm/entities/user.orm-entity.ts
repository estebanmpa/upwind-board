import { Column, Entity, Unique } from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity.js';

@Entity({ name: 'users' })
@Unique('uq_users_iam_id', ['iamId'])
export class UserOrmEntity extends BaseOrmEntity {
  @Column({ name: 'iam_id', type: 'varchar', length: 255 })
  iamId: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;
}
