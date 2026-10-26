import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INSTRUCTOR_USE_CASES } from '../../application/use-cases/instructors/index.js';
import { InstructorRepository } from '../../domain/repositories/instructor.repository.js';
import { InstructorOrmEntity } from '../persistence/type-orm/entities/instructor.orm-entity.js';
import { TypeOrmInstructorRepository } from '../persistence/type-orm/repositories/type-orm-instructor.repository.js';
import { InstructorsController } from '../rest/controllers/instructors.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorOrmEntity])],
  controllers: [InstructorsController],
  providers: [
    { provide: InstructorRepository, useClass: TypeOrmInstructorRepository },
    ...INSTRUCTOR_USE_CASES,
  ],
  exports: [InstructorRepository],
})
export class InstructorsModule {}
