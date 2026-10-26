import { Injectable } from '@nestjs/common';
import { Lesson } from '../../../domain/entities/lesson.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { LessonRepository } from '../../../domain/repositories/lesson.repository.js';
import { UpdateLessonDto } from '../../dtos/lessons/update-lesson.dto.js';
import { mergeLessonDraft } from '../../services/lesson-draft.factory.js';
import { LessonDraftValidator } from './lesson-draft.validator.js';

@Injectable()
export class UpdateLessonUseCase {
  constructor(
    private readonly lessons: LessonRepository,
    private readonly validator: LessonDraftValidator,
  ) {}

  async execute(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessons.findById(id);
    if (!lesson) throw new NotFoundError('Lesson', id);

    const draft = mergeLessonDraft(lesson, dto);
    await this.validator.validate(draft, lesson);
    return this.lessons.save(draft);
  }
}
