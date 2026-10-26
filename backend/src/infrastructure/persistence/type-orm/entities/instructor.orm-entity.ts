import { Column, Entity, Unique } from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity.js';

@Entity({ name: 'instructors' })
@Unique('uq_instructors_email', ['email'])
export class InstructorOrmEntity extends BaseOrmEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({
    name: 'iko_instructor_id',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  ikoInstructorId: string | null;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;
}
