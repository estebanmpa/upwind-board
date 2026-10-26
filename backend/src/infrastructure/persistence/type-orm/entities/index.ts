import { InstructorOrmEntity } from './instructor.orm-entity.js';
import { LessonSkillRecordOrmEntity } from './lesson-skill-record.orm-entity.js';
import { LessonStudentOrmEntity } from './lesson-student.orm-entity.js';
import { LessonOrmEntity } from './lesson.orm-entity.js';
import { SkillOrmEntity } from './skill.orm-entity.js';
import { StudentOrmEntity } from './student.orm-entity.js';

export const TYPEORM_ENTITIES = [
  InstructorOrmEntity,
  StudentOrmEntity,
  SkillOrmEntity,
  LessonOrmEntity,
  LessonStudentOrmEntity,
  LessonSkillRecordOrmEntity,
];
