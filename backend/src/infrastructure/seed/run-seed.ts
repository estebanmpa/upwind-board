import dataSource from '../persistence/type-orm/data-source.js';
import { loadInstructorSeed, loadSkillSeed } from './seed-data.js';
import { seed } from './seeder.js';

// CLI entry point: `yarn seed` (expects migrations to be applied).
await dataSource.initialize();
try {
  const result = await seed(dataSource, {
    skills: await loadSkillSeed(),
    instructors: await loadInstructorSeed(),
  });
  console.log(
    `Seed done: ${result.skills} skills upserted, ${result.instructorsCreated} instructor(s) created.`,
  );
} finally {
  await dataSource.destroy();
}
