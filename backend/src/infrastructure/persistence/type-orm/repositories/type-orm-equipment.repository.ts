import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Equipment,
  EquipmentData,
} from '../../../../domain/entities/equipment.entity.js';
import { NotFoundError } from '../../../../domain/errors/domain.error.js';
import {
  EquipmentBooking,
  EquipmentFilter,
  EquipmentRepository,
} from '../../../../domain/repositories/equipment.repository.js';
import {
  Page,
  PageRequest,
} from '../../../../domain/repositories/pagination.js';
import { EquipmentOrmEntity } from '../entities/equipment.orm-entity.js';
import { EquipmentMapper } from '../mappers/equipment.mapper.js';
import { withoutUndefined } from './without-undefined.js';

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

@Injectable()
export class TypeOrmEquipmentRepository extends EquipmentRepository {
  constructor(
    @InjectRepository(EquipmentOrmEntity)
    private readonly repository: Repository<EquipmentOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Equipment | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? EquipmentMapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Equipment[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((e) => EquipmentMapper.toDomain(e));
  }

  async findBySerialNumber(serialNumber: string): Promise<Equipment | null> {
    const entity = await this.repository.findOneBy({ serialNumber });
    return entity ? EquipmentMapper.toDomain(entity) : null;
  }

  async findPage(
    filter: EquipmentFilter,
    { page, limit }: PageRequest,
  ): Promise<Page<Equipment>> {
    const qb = this.repository.createQueryBuilder('equipment');
    if (filter.search) {
      qb.andWhere(
        '(equipment.name ILIKE :search OR equipment.brand ILIKE :search ' +
          'OR equipment.model ILIKE :search OR equipment.serial_number ILIKE :search)',
        { search: `%${escapeLike(filter.search)}%` },
      );
    }
    if (filter.type) {
      qb.andWhere('equipment.type = :type', { type: filter.type });
    }
    if (filter.status) {
      qb.andWhere('equipment.status = :status', { status: filter.status });
    }
    const [entities, total] = await qb
      .orderBy('equipment.type', 'ASC')
      .addOrderBy('equipment.name', 'ASC')
      .addOrderBy('equipment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      items: entities.map((e) => EquipmentMapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async findBookings(
    equipmentIds: string[],
    from: Date,
    to: Date,
    excludeLessonId?: string,
  ): Promise<EquipmentBooking[]> {
    if (equipmentIds.length === 0) return [];
    const rows: { equipment_id: string; lesson_id: string }[] =
      await this.repository.query(
        `
        SELECT le.equipment_id, le.lesson_id
        FROM lesson_equipment le
        JOIN lessons l ON l.id = le.lesson_id
        WHERE le.equipment_id = ANY($1::uuid[])
          AND l.starts_at < $3
          AND l.starts_at + l.duration_minutes * interval '1 minute' > $2
          AND ($4::uuid IS NULL OR l.id <> $4::uuid)
      `,
        [equipmentIds, from, to, excludeLessonId ?? null],
      );
    return rows.map((row) => ({
      equipmentId: row.equipment_id,
      lessonId: row.lesson_id,
    }));
  }

  async hasLessons(id: string): Promise<boolean> {
    const rows: { used: boolean }[] = await this.repository.query(
      `SELECT EXISTS (SELECT 1 FROM lesson_equipment WHERE equipment_id = $1) AS used`,
      [id],
    );
    return rows[0].used;
  }

  async create(data: EquipmentData): Promise<Equipment> {
    const saved = await this.repository.save(this.repository.create(data));
    return EquipmentMapper.toDomain(saved);
  }

  async update(
    id: string,
    changes: Partial<EquipmentData>,
  ): Promise<Equipment> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundError('Equipment', id);
    this.repository.merge(entity, withoutUndefined(changes));
    return EquipmentMapper.toDomain(await this.repository.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
