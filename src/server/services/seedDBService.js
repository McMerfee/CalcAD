/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import _ from 'lodash';
import fs from 'fs';
import util from 'util';
import path from 'path';
import emoji from 'node-emoji';

import logger from '../helpers/logger';

const readDir = util.promisify(fs.readdir);


const seedDatabase = async ({
  isSaveMiddlewareRequire = false,
  seedForce = false,
}) => {
  try {
    logger.info('[seedDatabase] Called');
    const dbDirPath = path.join(__dirname, '../db');
    const dbDir = await readDir(dbDirPath);
    const seedFiles = dbDir.filter((f) => f.endsWith('.seed.js'));

    seedFiles.forEach(async (file) => {
      const fileName = file.split('.seed.js')[0];
      const modelFile = dbDir.filter((f) => f === `${fileName}.model.js`)[0];
      const modelName = modelFile.split('.model.js')[0];
      const model = require(path.join(dbDirPath, modelFile))?.default;

      if (!model) throw new Error(`[seedDatabase] Error: Model '${modelName}' not found`);

      const fileContent = require(path.join(dbDirPath, file));

      // Add admin user
      if (modelName === 'Users') {
        const adminUser = await model.findOne({ role: 'admin' }).exec();

        if (!_.isEmpty(adminUser)) return;

        const seedResult = await model.create(fileContent);
        logger.info(`[seedDatabase] ${modelName}: ${seedResult.length} docs have been added ${emoji.get('tada')}`);
        return;
      }

      const shouldRun = await model.countDocuments().exec() === 0;

      if (!shouldRun && !seedForce) {
        logger.info(`[seedDatabase] ${modelName} already exist(s). Pass seedForce to replace.`);
        return;
      }

      if (isSaveMiddlewareRequire) {
        await model.remove({});
        const seedResult = await model.create(fileContent);
        logger.info(`[seedDatabase] ${modelName}: ${seedResult.length} docs have been replaced ${emoji.get('tada')}`);
        return;
      }

      await model.deleteMany({});
      const seedResult = await model.insertMany(fileContent);
      logger.info(`[seedDatabase] ${modelName}: ${seedResult.length} docs have been replaced ${emoji.get('tada')}`);
    });
  } catch (err) {
    throw new Error(err.message, '[seedDatabase]');
  }
};

export default { seedDatabase };
