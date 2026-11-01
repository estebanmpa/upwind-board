import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';
import { SkillStatus } from '../../../../domain/entities/skill-status.enum.js';
import { BaseOrmEntity } from './base.orm-entity.js';
import { LessonStudentOrmEntity } from './lesson-student.orm-entity.js';
import { SkillOrmEntity } from './skill.orm-entity.js';

@Entity({ name: 'lesson_skill_records' })
@Unique('uq_lesson_skill_records_lesson_student_id_skill_id', [
  'lessonStudentId',
  'skillId',
])
export class LessonSkillRecordOrmEntity extends BaseOrmEntity {
  @Column({ name: 'lesson_student_id', type: 'uuid' })
  lessonStudentId: string;

  @ManyToOne(() => LessonStudentOrmEntity, (ls) => ls.skillRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'lesson_student_id',
    foreignKeyConstraintName: 'fk_lesson_skill_records_lesson_student_id',
  })
  lessonStudent?: Relation<LessonStudentOrmEntity>;

  @Index('idx_lesson_skill_records_skill_id')
  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => SkillOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'skill_id',
    foreignKeyConstraintName: 'fk_lesson_skill_records_skill_id',
  })
  skill?: Relation<SkillOrmEntity>;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SkillStatus,
    enumName: 'skill_status',
  })
  status: SkillStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;
}
