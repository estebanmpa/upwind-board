import { Check, Column, Entity, Index } from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity.js';
import { numericTransformer } from './numeric.transformer.js';

@Entity({ name: 'students' })
@Index('idx_students_last_name_first_name', ['lastName', 'firstName'])
@Check('chk_students_weight_kg_positive', '"weight_kg" > 0')
export class StudentOrmEntity extends BaseOrmEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null;

  @Column({
    name: 'weight_kg',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  weightKg: number | null;

  @Column({
    name: 'emergency_contact_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  emergencyContactName: string | null;

  @Column({
    name: 'emergency_contact_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  emergencyContactPhone: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;
}
