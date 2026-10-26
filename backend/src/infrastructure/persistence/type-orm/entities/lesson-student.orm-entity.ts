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
import { LessonOrmEntity } from './lesson.orm-entity.js';
import { LessonSkillRecordOrmEntity } from './lesson-skill-record.orm-entity.js';
import { numericTransformer } from './numeric.transformer.js';
import { StudentOrmEntity } from './student.orm-entity.js';

@Entity({ name: 'lesson_students' })
@Unique('uq_lesson_students_lesson_id_student_id', ['lessonId', 'studentId'])
@Check('chk_lesson_students_kite_size_positive', '"kite_size_m2" > 0')
export class LessonStudentOrmEntity extends BaseOrmEntity {
  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => LessonOrmEntity, (lesson) => lesson.students, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'lesson_id',
    foreignKeyConstraintName: 'fk_lesson_students_lesson_id',
  })
  lesson?: Relation<LessonOrmEntity>;

  @Index('idx_lesson_students_student_id')
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => StudentOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'fk_lesson_students_student_id',
  })
  student?: Relation<StudentOrmEntity>;

  @Column({
    name: 'kite_size_m2',
    type: 'numeric',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  kiteSizeM2: number | null;

  @Column({ name: 'board', type: 'varchar', length: 100, nullable: true })
  board: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => LessonSkillRecordOrmEntity, (r) => r.lessonStudent)
  skillRecords: Relation<LessonSkillRecordOrmEntity[]>;
}
