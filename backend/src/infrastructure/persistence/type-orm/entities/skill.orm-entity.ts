import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
  type Relation,
} from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity.js';

@Entity({ name: 'skills' })
@Unique('uq_skills_code', ['code'])
@Check(
  'chk_skills_not_own_parent',
  '"parent_id" IS NULL OR "parent_id" <> "id"',
)
export class SkillOrmEntity extends BaseOrmEntity {
  @Index('idx_skills_parent_id')
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => SkillOrmEntity, (skill) => skill.children, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'fk_skills_parent_id',
  })
  parent?: Relation<SkillOrmEntity> | null;

  @OneToMany(() => SkillOrmEntity, (skill) => skill.parent)
  children?: Relation<SkillOrmEntity[]>;

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;
}
