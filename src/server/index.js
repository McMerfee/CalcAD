import _ from 'lodash';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv-safe';
import * as Sentry from '@sentry/node';
import Agenda from 'agenda';

import logger from './helpers/logger';
import errorLogger from './helpers/errorLogger';
import { httpErrorCodes } from './helpers/constants';
import { MigrationService, SeedDBService } from './services';

import OrdersDraft from './db/OrdersDraft.model';
import api from './api';
import './db';

dotenv.config({ path: '.env' });

const app = express();

const PORT = process.env.PORT || 4000;
const ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = ENV === 'production' || ENV === 'staging'
  ? process.env.MONGODB_URI
  : 'mongodb://localhost:27017/ads';

const agenda = new Agenda({ db: { address: MONGODB_URI } });

Sentry.init({ dsn: process.env.SENTRY_DNS });

// The request handler must be the first middleware on the app
if (ENV !== 'development') { app.use(Sentry.Handlers.requestHandler()); }

// Hide powered by express
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'ADS App v0.0.1');
  next();
});

app.use(helmet());
app.use(express.static('dist'));
app.use(bodyParser.json({ limit: '70mb' }));
app.use(bodyParser.urlencoded({
  limit: '70mb',
  extended: true,
  parameterLimit: 100000,
}));
app.use('/api', api);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../dist', 'index.html')));

// The error handler must be before any other error middleware and after all controllers
if (ENV !== 'development') {
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      if (httpErrorCodes.includes(error.status) || error.status === undefined) {
        return true;
      }
      return false;
    },
  }));
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  keepAlive: 300000,
}, (err, connection) => {
  if (err) {
    errorLogger(err, { method: 'Mongoose connect', url: ENV });
    mongoose.disconnect();
  }
  // Getting db and client to run migrations
  if (!_.isEmpty(connection)) {
    const db = mongoose.connection;
    const client = db?.client;
    MigrationService.runMigration(db, client);
  }
});

mongoose.connection.on('connected', () => {
  app.listen(PORT);
  logger.info('Mongoose connected successfully');

  // Seed DB with reqiured data
  SeedDBService.seedDatabase({ isSaveMiddlewareRequire: false, seedForce: false });
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose is disconnected');
});


// Jobs
agenda.define('delete old draft orders', async () => {
  const oneDay = new Date();
  oneDay.setDate(oneDay.getDate() - 1);

  const query = {
    createdOn: { $gt: oneDay.toISOString() },
  };

  await OrdersDraft.deleteMany(query);
});

(async () => {
  await agenda.start();
  await agenda.every('* */1 * * *', 'delete old draft orders');
})();
