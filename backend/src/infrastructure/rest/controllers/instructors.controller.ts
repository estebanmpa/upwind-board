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
import { CreateInstructorDto } from '../../../application/dtos/instructors/create-instructor.dto.js';
import { InstructorPageDto } from '../../../application/dtos/instructors/instructor-page.dto.js';
import { ListInstructorsQueryDto } from '../../../application/dtos/instructors/list-instructors-query.dto.js';
import { UpdateInstructorDto } from '../../../application/dtos/instructors/update-instructor.dto.js';
import { CreateInstructorUseCase } from '../../../application/use-cases/instructors/create-instructor.use-case.js';
import { DeleteInstructorUseCase } from '../../../application/use-cases/instructors/delete-instructor.use-case.js';
import { GetInstructorUseCase } from '../../../application/use-cases/instructors/get-instructor.use-case.js';
import { ListInstructorsUseCase } from '../../../application/use-cases/instructors/list-instructors.use-case.js';
import { UpdateInstructorUseCase } from '../../../application/use-cases/instructors/update-instructor.use-case.js';
import { Instructor } from '../../../domain/entities/instructor.entity.js';

@ApiTags('instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(
    private readonly createInstructor: CreateInstructorUseCase,
    private readonly updateInstructor: UpdateInstructorUseCase,
    private readonly deleteInstructor: DeleteInstructorUseCase,
    private readonly getInstructor: GetInstructorUseCase,
    private readonly listInstructors: ListInstructorsUseCase,
  ) {}

  @Get()
  list(@Query() query: ListInstructorsQueryDto): Promise<InstructorPageDto> {
    return this.listInstructors.execute(
      { search: query.search, active: query.active },
      query.toPageRequest(),
    );
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Instructor> {
    return this.getInstructor.execute(id);
  }

  @Post()
  create(@Body() dto: CreateInstructorDto): Promise<Instructor> {
    return this.createInstructor.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstructorDto,
  ): Promise<Instructor> {
    return this.updateInstructor.execute(id, dto);
  }

  /** Instructors with lessons cannot be deleted; deactivate them instead. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteInstructor.execute(id);
  }
}
