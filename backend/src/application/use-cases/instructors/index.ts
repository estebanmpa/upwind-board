import { CreateInstructorUseCase } from './create-instructor.use-case.js';
import { DeleteInstructorUseCase } from './delete-instructor.use-case.js';
import { GetInstructorUseCase } from './get-instructor.use-case.js';
import { ListInstructorsUseCase } from './list-instructors.use-case.js';
import { UpdateInstructorUseCase } from './update-instructor.use-case.js';

export const INSTRUCTOR_USE_CASES = [
  CreateInstructorUseCase,
  UpdateInstructorUseCase,
  DeleteInstructorUseCase,
  GetInstructorUseCase,
  ListInstructorsUseCase,
];
