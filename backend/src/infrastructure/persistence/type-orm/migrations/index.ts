import { InitialSchema1793016000000 } from './1793016000000-InitialSchema.js';
import { SeedInitialData1793016000001 } from './1793016000001-SeedInitialData.js';
import { AddUsers1795652256116 } from './1795652256116-AddUsers.js';

// Listed explicitly (instead of a glob) so the same options work from the
// compiled CLI data source and the Nest app.
export const TYPEORM_MIGRATIONS = [
  InitialSchema1793016000000,
  SeedInitialData1793016000001,
  AddUsers1795652256116,
];
