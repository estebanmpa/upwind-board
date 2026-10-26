import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../application/dtos/common/pagination-query.dto.js';
import { StudentLessonHistoryPageDto } from '../../../application/dtos/progress/student-lesson-history.dto.js';
import { StudentProgressDto } from '../../../application/dtos/progress/student-progress.dto.js';
import { GetStudentLessonsUseCase } from '../../../application/use-cases/progress/get-student-lessons.use-case.js';
import { GetStudentProgressUseCase } from '../../../application/use-cases/progress/get-student-progress.use-case.js';

@ApiTags('students')
@Controller('students/:id')
export class StudentProgressController {
  constructor(
    private readonly getStudentProgress: GetStudentProgressUseCase,
    private readonly getStudentLessons: GetStudentLessonsUseCase,
  ) {}

  /**
   * Skill tree with the student's current status on each leaf (the latest
   * one recorded, by lesson date), plus total lessons and hours.
   */
  @Get('progress')
  progress(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentProgressDto> {
    return this.getStudentProgress.execute(id);
  }

  /** Lessons taken by the student, most recent first, with what was worked. */
  @Get('lessons')
  lessons(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ): Promise<StudentLessonHistoryPageDto> {
    return this.getStudentLessons.execute(id, query.toPageRequest());
  }
}
