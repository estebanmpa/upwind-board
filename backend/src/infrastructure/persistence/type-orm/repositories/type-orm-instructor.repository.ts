import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Instructor,
  InstructorData,
} from '../../../../domain/entities/instructor.entity.js';
import { NotFoundError } from '../../../../domain/errors/domain.error.js';
import {
  InstructorFilter,
  InstructorRepository,
} from '../../../../domain/repositories/instructor.repository.js';
import {
  Page,
  PageRequest,
} from '../../../../domain/repositories/pagination.js';
import { InstructorOrmEntity } from '../entities/instructor.orm-entity.js';
import { InstructorMapper } from '../mappers/instructor.mapper.js';
import { applyNameSearch } from './name-search.js';
import { withoutUndefined } from './without-undefined.js';

@Injectable()
export class TypeOrmInstructorRepository extends InstructorRepository {
  constructor(
    @InjectRepository(InstructorOrmEntity)
    private readonly repository: Repository<InstructorOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Instructor | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? InstructorMapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Instructor[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((e) => InstructorMapper.toDomain(e));
  }

  async findByEmail(email: string): Promise<Instructor | null> {
    const entity = await this.repository.findOneBy({ email });
    return entity ? InstructorMapper.toDomain(entity) : null;
  }

  async findPage(
    filter: InstructorFilter,
    { page, limit }: PageRequest,
  ): Promise<Page<Instructor>> {
    const qb = this.repository.createQueryBuilder('instructor');
    applyNameSearch(qb, 'instructor', filter.search);
    if (filter.active !== undefined) {
      qb.andWhere('instructor.active = :active', { active: filter.active });
    }
    const [entities, total] = await qb
      .orderBy('instructor.last_name', 'ASC')
      .addOrderBy('instructor.first_name', 'ASC')
      .addOrderBy('instructor.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      items: entities.map((e) => InstructorMapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async hasLessons(id: string): Promise<boolean> {
    const rows: { used: boolean }[] = await this.repository.query(
      `SELECT EXISTS (SELECT 1 FROM lessons WHERE instructor_id = $1) AS used`,
      [id],
    );
    return rows[0].used;
  }

  async create(data: InstructorData): Promise<Instructor> {
    const saved = await this.repository.save(this.repository.create(data));
    return InstructorMapper.toDomain(saved);
  }

  async update(
    id: string,
    changes: Partial<InstructorData>,
  ): Promise<Instructor> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundError('Instructor', id);
    this.repository.merge(entity, withoutUndefined(changes));
    return InstructorMapper.toDomain(await this.repository.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
