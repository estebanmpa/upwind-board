import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { STUDENT_USE_CASES } from '../../application/use-cases/students/index.js';
import { StudentRepository } from '../../domain/repositories/student.repository.js';
import { StudentOrmEntity } from '../persistence/type-orm/entities/student.orm-entity.js';
import { TypeOrmStudentRepository } from '../persistence/type-orm/repositories/type-orm-student.repository.js';
import { StudentsController } from '../rest/controllers/students.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudentOrmEntity])],
  controllers: [StudentsController],
  providers: [
    { provide: StudentRepository, useClass: TypeOrmStudentRepository },
    ...STUDENT_USE_CASES,
  ],
  exports: [StudentRepository],
})
export class StudentsModule {}
