import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity.js';
import { InstructorOrmEntity } from './instructor.orm-entity.js';
import { LessonStudentOrmEntity } from './lesson-student.orm-entity.js';

@Entity({ name: 'lessons' })
@Check('chk_lessons_duration_minutes_positive', '"duration_minutes" > 0')
@Check(
  'chk_lessons_wind_range',
  '"wind_min_knots" IS NULL OR "wind_max_knots" IS NULL OR "wind_min_knots" <= "wind_max_knots"',
)
export class LessonOrmEntity extends BaseOrmEntity {
  @Index('idx_lessons_instructor_id')
  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId: string;

  @ManyToOne(() => InstructorOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'instructor_id',
    foreignKeyConstraintName: 'fk_lessons_instructor_id',
  })
  instructor?: Relation<InstructorOrmEntity>;

  @Index('idx_lessons_starts_at')
  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ name: 'spot', type: 'varchar', length: 200 })
  spot: string;

  @Column({
    name: 'wind_direction',
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  windDirection: string | null;

  @Column({ name: 'wind_min_knots', type: 'integer', nullable: true })
  windMinKnots: number | null;

  @Column({ name: 'wind_max_knots', type: 'integer', nullable: true })
  windMaxKnots: number | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => LessonStudentOrmEntity, (ls) => ls.lesson)
  students: Relation<LessonStudentOrmEntity[]>;
}
