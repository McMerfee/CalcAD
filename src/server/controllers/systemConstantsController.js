import _ from 'lodash';
import express from 'express';
import dotenv from 'dotenv-safe';

import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';
import {
  sanitizeSystemTypeOrThrow,
  sanitize1CConstantsOrThrow,
} from '../helpers/sanitizer';
import {
  checkForSystemTypeField,
  messagesTranslationFor1CExchange,
} from '../helpers/jsonHelper';

import { SystemConstantsService } from '../services';

import {
  ExchangeStore,
  SystemConctants,
  Users,
} from '../db';

dotenv.config({ path: '.env' });

const router = express.Router();
const {
  NODE_ENV = 'development',
  STORE_SYSTEM_CONSTANTS_EXCHANGE = false,
} = process.env;

router.get('/', getSystemConctants);

// 1C Exchange
router.put('/1c', updateSystemConctantsFrom1C);


async function getSystemConctants(req, res) {
  try {
    const { systemType } = req.query;
    const sanitizedSystemType = sanitizeSystemTypeOrThrow(systemType);
    logger.info(`Requesting Conctants for System Type: ${sanitizedSystemType}`);

    const systemConctants = await SystemConctants.find({ systemType: sanitizedSystemType }).lean();

    return res.send({ systemConctants });
  } catch (err) {
    errorLogger(err, { method: 'getSystemConctants', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function updateSystemConctantsFrom1C(req, res) {
  try {
    const constants1C = req.body;
    logger.info(`[updateSystemConctantsFrom1C] Called. Constants count: ${constants1C?.length}`);

    let token = req.headers?.authorization;
    if (!token || !token.startsWith('Bearer ')) return res.status(403).send({ error: { message: 'INVALID_TOKEN' } });

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    if (_.isEmpty(req.body) || _.isEmpty(constants1C)) {
      return res.status(400).send({ error: { message: 'BAD_REQUEST' } });
    }

    // Check for new required field for all exchanging constants
    const systemTypeFields = checkForSystemTypeField(constants1C);
    const translate = messagesTranslationFor1CExchange.uk;

    if (systemTypeFields.missingSystemType) {
      return res.status(400).send({
        error: {
          message: `${translate.MISSING_SYSTEM_TYPE_FIELDS}: ${systemTypeFields.missingSystemType}`,
        },
      });
    }

    if (systemTypeFields.emptySystemType) {
      logger.warn(`[updateSystemConctantsFrom1C] Empty SystemType count: ${systemTypeFields.emptySystemType}`);
    }

    let exchangeData = {};
    if (STORE_SYSTEM_CONSTANTS_EXCHANGE) {
      const dataToStore = {
        name: 'system-constants',
        data: req.body,
      };
      exchangeData = await ExchangeStore.create(dataToStore, (err, doc) => {
        if (err) console.error('ExchangeStore, system-constants error:', err);
        logger.info(`New ExchangeStore doc ID: ${doc?._id}`);
      });
    }

    const sanitized1CConstants = sanitize1CConstantsOrThrow(constants1C);

    const response = await SystemConstantsService
      .parseAndUpdateConstantsFrom1C(sanitized1CConstants, exchangeData?._id);

    return res.send(response);
  } catch (err) {
    errorLogger(err, { method: 'updateSystemConctantsFrom1C', url: NODE_ENV });
    return res.status(500).send(err);
  }
}



module.exports = router;
