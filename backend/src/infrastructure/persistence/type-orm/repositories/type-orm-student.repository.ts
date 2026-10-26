import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Student,
  StudentData,
} from '../../../../domain/entities/student.entity.js';
import { NotFoundError } from '../../../../domain/errors/domain.error.js';
import {
  Page,
  PageRequest,
} from '../../../../domain/repositories/pagination.js';
import {
  StudentFilter,
  StudentRepository,
} from '../../../../domain/repositories/student.repository.js';
import { StudentOrmEntity } from '../entities/student.orm-entity.js';
import { StudentMapper } from '../mappers/student.mapper.js';
import { applyNameSearch } from './name-search.js';
import { withoutUndefined } from './without-undefined.js';

@Injectable()
export class TypeOrmStudentRepository extends StudentRepository {
  constructor(
    @InjectRepository(StudentOrmEntity)
    private readonly repository: Repository<StudentOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Student | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Student[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((e) => StudentMapper.toDomain(e));
  }

  async findPage(
    filter: StudentFilter,
    { page, limit }: PageRequest,
  ): Promise<Page<Student>> {
    const qb = this.repository.createQueryBuilder('student');
    applyNameSearch(qb, 'student', filter.search);
    const [entities, total] = await qb
      .orderBy('student.last_name', 'ASC')
      .addOrderBy('student.first_name', 'ASC')
      .addOrderBy('student.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      items: entities.map((e) => StudentMapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async hasLessons(id: string): Promise<boolean> {
    const rows: { used: boolean }[] = await this.repository.query(
      `SELECT EXISTS (SELECT 1 FROM lesson_students WHERE student_id = $1) AS used`,
      [id],
    );
    return rows[0].used;
  }

  async create(data: StudentData): Promise<Student> {
    const saved = await this.repository.save(this.repository.create(data));
    return StudentMapper.toDomain(saved);
  }

  async update(id: string, changes: Partial<StudentData>): Promise<Student> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundError('Student', id);
    this.repository.merge(entity, withoutUndefined(changes));
    return StudentMapper.toDomain(await this.repository.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
