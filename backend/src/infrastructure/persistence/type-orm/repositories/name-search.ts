import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

/** Case-insensitive "contains" on first_name, last_name or the full name. */
export function applyNameSearch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  search: string | undefined,
): SelectQueryBuilder<T> {
  if (!search) return qb;
  return qb.andWhere(
    `(${alias}.first_name ILIKE :search OR ${alias}.last_name ILIKE :search ` +
      `OR (${alias}.first_name || ' ' || ${alias}.last_name) ILIKE :search)`,
    { search: `%${escapeLike(search)}%` },
  );
}
