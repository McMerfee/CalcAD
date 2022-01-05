import express from 'express';
import dotenv from 'dotenv-safe';

import logger from '../helpers/logger';
import errorLogger from '../helpers/errorLogger';
import { sanitizeSystemTypeOrThrow } from '../helpers/sanitizer';
import {
  sideProfilesBySystemType,
  connectingProfilesBySystemType,
} from '../helpers/constants';

import {
  AluminiumColors,
  Brushes,
  ConnectingProfiles,
  DoorLatchMechanisms,
  Filling,
  FillingFeatures,
  Mechanisms,
  SideProfiles,
  SystemConctants,
} from '../db';

dotenv.config({ path: '.env' });

const router = express.Router();
const ENV = process.env.NODE_ENV || 'development';

router.get('/', getConfig);
router.get('/connecting-profiles/list', getConnectingProfilesList);
router.get('/side-profiles/list', getSideProfilesList);

async function getConfig(req, res) {
  try {
    const { systemType } = req.query;
    const sanitizedSystemType = sanitizeSystemTypeOrThrow(systemType);
    logger.info(`Requesting config for: ${sanitizedSystemType}`);

    const aluminiumColors = await AluminiumColors.find().sort({ popularity: 'asc' });
    const systemConctants = await SystemConctants.find({ systemType: sanitizedSystemType }).lean();
    const mechanisms = await Mechanisms.find().sort({ popularity: 'asc' });
    const doorLatchMechanisms = await DoorLatchMechanisms.find().lean();
    const filling = await Filling.find().lean();
    const fillingFeatures = await FillingFeatures.find().lean();
    const brushes = await Brushes.find().lean();

    const connectingProfiles = await ConnectingProfiles
      .find({ articleCode: { $in: connectingProfilesBySystemType[sanitizedSystemType] } })
      .sort({ popularity: 'asc' });

    const sideProfiles = await SideProfiles
      .find({ articleCode: { $in: sideProfilesBySystemType[sanitizedSystemType] } })
      .find()
      .sort({ popularity: 'asc' });

    return res.send({
      config: {
        aluminiumColors,
        systemConctants,
        connectingProfiles,
        doorLatchMechanisms,
        sideProfiles,
        mechanisms,
        filling,
        fillingFeatures,
        brushes,
      },
    });
  } catch (err) {
    errorLogger(err, { method: 'getConfig', url: ENV });
    return res.status(500).send(err);
  }
}

async function getConnectingProfilesList(req, res) {
  try {
    const { systemType } = req.query;
    const sanitizedSystemType = sanitizeSystemTypeOrThrow(systemType);

    const connectingProfiles = await ConnectingProfiles
      .find({ systemType: sanitizedSystemType })
      .lean();

    return res.send({ connectingProfiles });
  } catch (err) {
    errorLogger(err, { method: 'getConnectingProfilesList', url: ENV });
    return res.status(500).send(err);
  }
}

async function getSideProfilesList(req, res) {
  try {
    const { systemType } = req.query;
    const sanitizedSystemType = sanitizeSystemTypeOrThrow(systemType);

    const sideProfiles = await SideProfiles
      .find({ systemType: sanitizedSystemType })
      .lean();

    return res.send({ sideProfiles });
  } catch (err) {
    errorLogger(err, { method: 'getSideProfilesList', url: ENV });
    return res.status(500).send(err);
  }
}

module.exports = router;
