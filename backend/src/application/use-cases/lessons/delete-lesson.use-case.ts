import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { LessonRepository } from '../../../domain/repositories/lesson.repository.js';

@Injectable()
export class DeleteLessonUseCase {
  constructor(private readonly lessons: LessonRepository) {}

  /** Removes the lesson together with its students and skill records. */
  async execute(id: string): Promise<void> {
    if (!(await this.lessons.findById(id))) {
      throw new NotFoundError('Lesson', id);
    }
    await this.lessons.delete(id);
  }
}
