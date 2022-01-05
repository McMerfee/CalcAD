
import _ from 'lodash';
import dotenv from 'dotenv-safe';
import emoji from 'node-emoji';

import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';

import {
  ExchangeStore,
  SystemConctants,
} from '../db';

dotenv.config({ path: '.env' });
const ENV = process.env.NODE_ENV || 'development';


const parseAndUpdateConstantsFrom1C = async (constants1C, exchangeDataID) => {
  // eslint-disable-next-line
  logger.info(`[SystemConstantsService.parseAndUpdateConstantsFrom1C] Called. Sanitized 1C Constants: ${constants1C.length}`);

  const uniqSideProfilesNames = _.uniq(constants1C.map((i) => i['Тип БП']));
  const rejectedRecordsIDs = [];
  const successfulRecordsIDs = [];

  const constantsDB = await SystemConctants.find({ sideProfile: { $in: uniqSideProfilesNames } }).lean();

  const awaits = constants1C.map(async (constant1C) => {
    try {
      const dbItem = constantsDB
        .find((i) => i.systemType === constant1C['Тип системы'] && i.sideProfile === constant1C['Тип БП']);

      if (!dbItem) {
        const itemToCreate = {
          systemType: constant1C['Тип системы'],
          sideProfile: constant1C['Тип БП'],
          connectingProfilesDependence: [],
          topProfilesDependence: [],
          bottomProfilesDependence: [],
          carriageProfilesDependence: [],
          standbyCarriagesProfilesDependence: [],
          guidanceProfilesDependence: [],
          mechanismsDependence: [],
          doorLatchMechanismsDependence: [],
          directionsOfSections: ['horizontal', 'vertical'],
          defaultConnectingProfile: '',
          defaultMechanism: '',
          defaultStopper: 'stopor_new',
          X1: constant1C['Парам для расчета ширины двери'],
          X2: constant1C?.X2 || 0,
          X2_standby: constant1C?.X2_standby || 0,
          X4: constant1C?.X4 || 0,
          X5: constant1C['Парам для расчета нижнего профиля'] || constant1C['Парам для расчета верхнего профиля'] || 0,
          X12H: constant1C['Высота наполнения (стекло)'] || constant1C['Высота наполнения'] || 0,
          X13W: constant1C['Ширина наполнения (стекло)'] || constant1C['Ширина наполнения'] || 0,
          topGap: constant1C?.topGap || 0,
          bottomGap: constant1C?.bottomGap || 0,
          hiddingTopSize: constant1C?.hiddingTopSize || 0,
          hiddingBottomSize: constant1C?.hiddingBottomSize || 0,
          hiddingSideSize: constant1C?.hiddingSideSize || 0,
          topSealing: constant1C?.topSealing || 0,
          bottomSealing: constant1C?.bottomSealing || 0,
          sideSealing: constant1C?.sideSealing || 0,
          connectingSealing: constant1C?.connectingSealing || 0,
        };
        return SystemConctants.create(itemToCreate);
      }

      const itemToUpdate = {
        updatedOn: new Date().toISOString(),
        X1: constant1C['Парам для расчета ширины двери'],
        X5: constant1C['Парам для расчета нижнего профиля'] || constant1C['Парам для расчета верхнего профиля'] || 0,
        X12H: constant1C['Высота наполнения (стекло)'] || constant1C['Высота наполнения'] || 0,
        X13W: constant1C['Ширина наполнения (стекло)'] || constant1C['Ширина наполнения'] || 0,
      };

      return SystemConctants.findOneAndUpdate(
        { _id: dbItem._id },
        { $set: itemToUpdate },
        { new: true },
        (error, result) => {
          if (error) {
            logger.error(error);
            rejectedRecordsIDs.push(dbItem._id);
          } else if (result) { successfulRecordsIDs.push(dbItem._id); }
        },
      );
    } catch (err) {
      errorLogger(err, { method: 'SystemConctantsService.parseAndUpdateConstantsFrom1C', url: ENV });
    }
    return 1;
  });

  const outcome = await Promise.allSettled(awaits);

  if (successfulRecordsIDs.length) {
    logger.info(`${emoji.get('tada')} SystemConctants updates: ${successfulRecordsIDs.length}`);
  }


  outcome.filter(({ status }) => status === 'rejected').forEach((result) => {
    errorLogger(result.reason, { method: 'SystemConstantsService.parseAndUpdateConstantsFrom1C', url: ENV });
  });

  const exchangeOutcome = {
    rejectedRecords: {
      IDs: rejectedRecordsIDs,
      count: outcome.filter(({ status }) => status === 'rejected').length,
    },
    successfulRecords: {
      IDs: successfulRecordsIDs,
      count: outcome.filter(({ status }) => status === 'fulfilled').length,
    },
  };

  if (exchangeDataID) {
    const query = { _id: exchangeDataID };
    const updateDoc = { $set: exchangeOutcome };
    const options = { new: true };
    const callback = (error) => { if (error) logger.error(error); };

    const updatedExchangeStore = await ExchangeStore.findOneAndUpdate(query, updateDoc, options, callback);
    logger.info('updatedExchangeStore ID:', updatedExchangeStore?._id);
  }

  return { exchangeOutcome };
};

export default {
  parseAndUpdateConstantsFrom1C,
};
