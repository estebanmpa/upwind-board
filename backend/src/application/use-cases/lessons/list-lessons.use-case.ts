import { Injectable } from '@nestjs/common';
import { Lesson } from '../../../domain/entities/lesson.entity.js';
import {
  LessonFilter,
  LessonOrder,
  LessonRepository,
} from '../../../domain/repositories/lesson.repository.js';
import { Page, PageRequest } from '../../../domain/repositories/pagination.js';

@Injectable()
export class ListLessonsUseCase {
  constructor(private readonly lessons: LessonRepository) {}

  execute(
    filter: LessonFilter,
    request: PageRequest,
    order?: LessonOrder,
  ): Promise<Page<Lesson>> {
    return this.lessons.findPage(filter, request, order);
  }
}
