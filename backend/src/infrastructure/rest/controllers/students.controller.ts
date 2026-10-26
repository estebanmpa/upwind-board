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
import { CreateStudentDto } from '../../../application/dtos/students/create-student.dto.js';
import { ListStudentsQueryDto } from '../../../application/dtos/students/list-students-query.dto.js';
import { StudentPageDto } from '../../../application/dtos/students/student-page.dto.js';
import { UpdateStudentDto } from '../../../application/dtos/students/update-student.dto.js';
import { CreateStudentUseCase } from '../../../application/use-cases/students/create-student.use-case.js';
import { DeleteStudentUseCase } from '../../../application/use-cases/students/delete-student.use-case.js';
import { GetStudentUseCase } from '../../../application/use-cases/students/get-student.use-case.js';
import { ListStudentsUseCase } from '../../../application/use-cases/students/list-students.use-case.js';
import { UpdateStudentUseCase } from '../../../application/use-cases/students/update-student.use-case.js';
import { Student } from '../../../domain/entities/student.entity.js';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly createStudent: CreateStudentUseCase,
    private readonly updateStudent: UpdateStudentUseCase,
    private readonly deleteStudent: DeleteStudentUseCase,
    private readonly getStudent: GetStudentUseCase,
    private readonly listStudents: ListStudentsUseCase,
  ) {}

  /** Paginated list, ordered by last name; `search` filters by name. */
  @Get()
  list(@Query() query: ListStudentsQueryDto): Promise<StudentPageDto> {
    return this.listStudents.execute(
      { search: query.search },
      query.toPageRequest(),
    );
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Student> {
    return this.getStudent.execute(id);
  }

  @Post()
  create(@Body() dto: CreateStudentDto): Promise<Student> {
    return this.createStudent.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<Student> {
    return this.updateStudent.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteStudent.execute(id);
  }
}
