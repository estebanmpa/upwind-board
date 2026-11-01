import { ValueTransformer } from 'typeorm';

/** pg returns NUMERIC columns as strings; expose them as numbers. */
export const numericTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};
