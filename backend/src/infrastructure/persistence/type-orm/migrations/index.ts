import { InitialSchema1793016000000 } from './1793016000000-InitialSchema.js';
import { SeedInitialData1793016000001 } from './1793016000001-SeedInitialData.js';
import { EnglishWindDirections1793016000002 } from './1793016000002-EnglishWindDirections.js';

// Listed explicitly (instead of a glob) so the same options work from the
// compiled CLI data source and the Nest app.
export const TYPEORM_MIGRATIONS = [
  InitialSchema1793016000000,
  SeedInitialData1793016000001,
  EnglishWindDirections1793016000002,
];
