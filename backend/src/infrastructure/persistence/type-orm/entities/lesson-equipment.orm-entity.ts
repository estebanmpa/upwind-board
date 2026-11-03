import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { EquipmentOrmEntity } from './equipment.orm-entity.js';
import { LessonOrmEntity } from './lesson.orm-entity.js';

/** Equipment assigned to a lesson. */
@Entity({ name: 'lesson_equipment' })
export class LessonEquipmentOrmEntity {
  @PrimaryColumn({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => LessonOrmEntity, (lesson) => lesson.equipment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'lesson_id',
    foreignKeyConstraintName: 'fk_lesson_equipment_lesson_id',
  })
  lesson?: Relation<LessonOrmEntity>;

  @Index('idx_lesson_equipment_equipment_id')
  @PrimaryColumn({ name: 'equipment_id', type: 'uuid' })
  equipmentId: string;

  @ManyToOne(() => EquipmentOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'equipment_id',
    foreignKeyConstraintName: 'fk_lesson_equipment_equipment_id',
  })
  equipment?: Relation<EquipmentOrmEntity>;
}
