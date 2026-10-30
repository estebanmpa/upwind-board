import { Module } from '@nestjs/common';
import { GetStudentLessonsUseCase } from '../../application/use-cases/progress/get-student-lessons.use-case.js';
import { GetStudentProgressUseCase } from '../../application/use-cases/progress/get-student-progress.use-case.js';
import { StudentProgressController } from '../rest/controllers/student-progress.controller.js';
import { LessonsModule } from './lessons.module.js';
import { SkillsModule } from './skills.module.js';
import { StudentsModule } from './students.module.js';

/** Read models that combine students, lessons and the skill tree. */
@Module({
  imports: [StudentsModule, LessonsModule, SkillsModule],
  controllers: [StudentProgressController],
  providers: [GetStudentProgressUseCase, GetStudentLessonsUseCase],
})
export class ProgressModule {}
