import { up } from 'migrate-mongo';

import logger from '../helpers/logger';

const runMigration = async (db, client) => {
  logger.info('[runMigration] Called');
  const migrated = await up(db, client);
  if (!migrated.length) logger.info('[runMigration] Everything is up to date');
};

export default { runMigration };
