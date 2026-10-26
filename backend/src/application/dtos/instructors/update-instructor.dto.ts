import { PartialType } from '@nestjs/swagger';
import { CreateInstructorDto } from './create-instructor.dto.js';

export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {}
