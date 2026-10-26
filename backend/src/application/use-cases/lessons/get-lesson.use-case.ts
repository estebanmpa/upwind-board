import { Injectable } from '@nestjs/common';
import { Lesson } from '../../../domain/entities/lesson.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { LessonRepository } from '../../../domain/repositories/lesson.repository.js';

@Injectable()
export class GetLessonUseCase {
  constructor(private readonly lessons: LessonRepository) {}

  async execute(id: string): Promise<Lesson> {
    const lesson = await this.lessons.findById(id);
    if (!lesson) throw new NotFoundError('Lesson', id);
    return lesson;
  }
}
