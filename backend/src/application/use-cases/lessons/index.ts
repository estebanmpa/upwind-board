import { CreateLessonUseCase } from './create-lesson.use-case.js';
import { DeleteLessonUseCase } from './delete-lesson.use-case.js';
import { GetLessonUseCase } from './get-lesson.use-case.js';
import { LessonDraftValidator } from './lesson-draft.validator.js';
import { ListLessonsUseCase } from './list-lessons.use-case.js';
import { UpdateLessonUseCase } from './update-lesson.use-case.js';

export const LESSON_USE_CASES = [
  LessonDraftValidator,
  CreateLessonUseCase,
  UpdateLessonUseCase,
  DeleteLessonUseCase,
  GetLessonUseCase,
  ListLessonsUseCase,
];
