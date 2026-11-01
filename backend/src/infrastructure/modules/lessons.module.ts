import { Module } from '@nestjs/common';
import { LESSON_USE_CASES } from '../../application/use-cases/lessons/index.js';
import { LessonRepository } from '../../domain/repositories/lesson.repository.js';
import { TypeOrmLessonRepository } from '../persistence/type-orm/repositories/type-orm-lesson.repository.js';
import { LessonsController } from '../rest/controllers/lessons.controller.js';
import { InstructorsModule } from './instructors.module.js';
import { SkillsModule } from './skills.module.js';
import { StudentsModule } from './students.module.js';

@Module({
  imports: [InstructorsModule, StudentsModule, SkillsModule],
  controllers: [LessonsController],
  providers: [
    { provide: LessonRepository, useClass: TypeOrmLessonRepository },
    ...LESSON_USE_CASES,
  ],
  exports: [LessonRepository],
})
export class LessonsModule {}
