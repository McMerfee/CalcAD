import express from 'express';
import dotenv from 'dotenv-safe';

import logger from '../helpers/logger';
import errorLogger from '../helpers/errorLogger';

import { Delivery } from '../db';

dotenv.config({ path: '.env' });

const router = express.Router();
const ENV = process.env.NODE_ENV || 'development';

router.get('/', getDeliveryOptions);

async function getDeliveryOptions(req, res) {
  try {
    if (!req.user?.userId) return res.status(500).send('Non-authorized user');

    const deliveryOptions = await Delivery.find({}, '-updatedOn').sort({ region: 'asc' }).lean();
    logger.info(`Fetched ${deliveryOptions?.length} delivery types. User ID: ${req.user.userId}`);

    return res.send({ deliveryOptions });
  } catch (err) {
    errorLogger(err, { method: 'getDeliveryOptions', url: ENV });
    return res.status(500).send(err);
  }
}

module.exports = router;
