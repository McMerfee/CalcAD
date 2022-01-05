import _ from 'lodash';
import express from 'express';
import dotenv from 'dotenv-safe';

import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';

import {
  defaultPackageName,
  defaultPackagesByRegion,
  defaultRegion,
} from '../helpers/constants';

import {
  PriceList,
  Users,
} from '../db';

dotenv.config({ path: '.env' });

const router = express.Router();
const ENV = process.env.NODE_ENV || 'development';

router.get('/', getPriceList);

async function getPriceList(req, res) {
  try {
    const userId = req?.query?.userId;
    let packageName = defaultPackageName;
    let region = defaultRegion;

    if (!_.isEmpty(userId)) {
      const user = await Users
        .findOne({ _id: userId })
        .select({ packageName: 1, primaryRegion: 1 })
        .lean();
      region = user?.primaryRegion || defaultRegion;
      // Note: Should use packageName of defaultRegion
      packageName = user?.packageName || defaultPackageName;
      const hasRegionDefaultPackage = defaultPackagesByRegion.find((p) => p.packageName === packageName);

      if (!_.isEmpty(hasRegionDefaultPackage)) {
        region = defaultRegion;
        packageName = defaultPackageName;
      }
    }

    const priceListQuery = [
      {
        $match: {
          isHidden: { $ne: true },
          $or: [
            { region },
            { region: defaultRegion },
          ],
        },
      },
      { $unwind: '$prices' },
      {
        $project: {
          region: 1,
          articleCode: 1,
          itemType: 1,
          labelRu: 1,
          labelUk: 1,
          id1C: 1,
          isHidden: 1,
          packageName: '$prices.packageName',
          price: '$prices.price',
        },
      },
      {
        $match: {
          $or: [
            { packageName }, { packageName: defaultPackageName },
          ],
        },
      },
      { $sort: { region: 1, articleCode: 1 } },
    ];

    const priceList = await PriceList.aggregate([...priceListQuery]);

    if (userId) {
      // eslint-disable-next-line
      logger.info(`Fetched ${priceList.length} PriceList items for user ID ${userId}. Region: ${region}. User's package name: ${packageName}. Default package name: ${defaultPackageName}.`);
    } else {
      // eslint-disable-next-line
      logger.info(`Fetched ${priceList.length} PriceList items for unauthorized user. Region: ${region}. Package name: ${packageName}.`);
    }

    return res.send({ priceList });
  } catch (err) {
    errorLogger(err, { method: 'getPriceList', url: ENV });
    return res.status(500).send(err);
  }
}


module.exports = router;
