import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateLessonDto } from '../../../application/dtos/lessons/create-lesson.dto.js';
import { LessonPageDto } from '../../../application/dtos/lessons/lesson-page.dto.js';
import { ListLessonsQueryDto } from '../../../application/dtos/lessons/list-lessons-query.dto.js';
import { UpdateLessonDto } from '../../../application/dtos/lessons/update-lesson.dto.js';
import { CreateLessonUseCase } from '../../../application/use-cases/lessons/create-lesson.use-case.js';
import { DeleteLessonUseCase } from '../../../application/use-cases/lessons/delete-lesson.use-case.js';
import { GetLessonUseCase } from '../../../application/use-cases/lessons/get-lesson.use-case.js';
import { ListLessonsUseCase } from '../../../application/use-cases/lessons/list-lessons.use-case.js';
import { UpdateLessonUseCase } from '../../../application/use-cases/lessons/update-lesson.use-case.js';
import { Lesson } from '../../../domain/entities/lesson.entity.js';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly createLesson: CreateLessonUseCase,
    private readonly updateLesson: UpdateLessonUseCase,
    private readonly deleteLesson: DeleteLessonUseCase,
    private readonly getLesson: GetLessonUseCase,
    private readonly listLessons: ListLessonsUseCase,
  ) {}

  /** Most recent first. */
  @Get()
  list(@Query() query: ListLessonsQueryDto): Promise<LessonPageDto> {
    return this.listLessons.execute(
      {
        instructorId: query.instructorId,
        studentId: query.studentId,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
      },
      query.toPageRequest(),
    );
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Lesson> {
    return this.getLesson.execute(id);
  }

  /** Creates the lesson, its students and their skill records atomically. */
  @Post()
  create(@Body() dto: CreateLessonDto): Promise<Lesson> {
    return this.createLesson.execute(dto);
  }

  /** Updates the lesson; see `students` for how participants are merged. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
  ): Promise<Lesson> {
    return this.updateLesson.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteLesson.execute(id);
  }
}
