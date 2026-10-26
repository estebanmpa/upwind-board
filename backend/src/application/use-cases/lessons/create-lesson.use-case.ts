import { Injectable } from '@nestjs/common';
import { Lesson } from '../../../domain/entities/lesson.entity.js';
import { LessonRepository } from '../../../domain/repositories/lesson.repository.js';
import { CreateLessonDto } from '../../dtos/lessons/create-lesson.dto.js';
import { createLessonDraft } from '../../services/lesson-draft.factory.js';
import { LessonDraftValidator } from './lesson-draft.validator.js';

@Injectable()
export class CreateLessonUseCase {
  constructor(
    private readonly lessons: LessonRepository,
    private readonly validator: LessonDraftValidator,
  ) {}

  async execute(dto: CreateLessonDto): Promise<Lesson> {
    const draft = createLessonDraft(dto);
    await this.validator.validate(draft);
    return this.lessons.save(draft);
  }
}
