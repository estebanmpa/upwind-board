import { CreateStudentUseCase } from './create-student.use-case.js';
import { DeleteStudentUseCase } from './delete-student.use-case.js';
import { GetStudentUseCase } from './get-student.use-case.js';
import { ListStudentsUseCase } from './list-students.use-case.js';
import { UpdateStudentUseCase } from './update-student.use-case.js';

export const STUDENT_USE_CASES = [
  CreateStudentUseCase,
  UpdateStudentUseCase,
  DeleteStudentUseCase,
  GetStudentUseCase,
  ListStudentsUseCase,
];
