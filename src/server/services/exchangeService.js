import _ from 'lodash';
import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv-safe';
import emoji from 'node-emoji';
import JSONStream from 'JSONStream';
import es from 'event-stream';

import { defaultAluminiumColor } from '../../client/helpers/constants';

import logger from '../helpers/logger';
import errorLogger from '../helpers/errorLogger';
import { getEmailTemplatePath } from '../helpers/emailsHelper';

import {
  defaultPackageName as defaultPackageOfDefaulRegion,
  defaultRegion,
  defaultPackagesByRegion,
} from '../helpers/constants';

import {
  is1CItemValid,
  is1CItemOfMainRegionValid,
  isSideProfileValid,
  isSideProfile,
  isConnectingProfile,
  isDoorLatchMechanisms,
  isFillingFeature,
  isMechanism,
  isFilling,
} from '../helpers/validation';

import {
  sideProfilesPopularity,
  connectingProfilesPopularity,
  mechanismsPopularity,
} from '../helpers/itemsPopularity';

import { isDefaultPackagePriceEmpty } from '../helpers/jsonHelper';
import { sanitizeJSONCustomer } from '../helpers/sanitizer';

import {
  ConnectingProfiles,
  Delivery,
  DoorLatchMechanisms,
  ExchangeStore,
  Filling,
  FillingFeatures,
  Mechanisms,
  PriceList,
  SideProfiles,
  Users,
} from '../db';

import { EmailService } from './index';

dotenv.config({ path: '.env' });
const { Types: { Long } } = mongoose;

dotenv.config({ path: '.env' });

const {
  NODE_ENV = 'development',
  SITE_URL,
  STORE_DELIVERY_TYPES_EXCHANGE,
  STORE_ITEMS_LIST_EXCHANGE_RESULT,
} = process.env;

const logoPath = '/src/client/assets/images/logo.png';


const inspectCustomers = async (jsonPath) => {
  logger.info(`[ExchangeService.inspectCustomers] Called. JSON path: ${jsonPath}`);

  if (!jsonPath) return 0;

  const sanitizedPhonesUniq = [];
  const outcome = {
    region: '',
    totalCount: 0,
    emptyPackagesCount: 0,
    emptyID1CCount: 0,
    incorrectPhonesCount: 0,
    duplicatesByPhoneNumberCount: 0,
    incorrectUsers: [],
    duplicatesByPhoneNumber: [],
  };

  const promise = await new Promise((resolve) => {
    const stream = JSONStream.parse('*');

    stream.on('data', async (jsonUser) => {
      const id1C = jsonUser['??????'];
      const packageName = jsonUser['????????????']?.trim();
      const primaryRegion = jsonUser['????????????']?.trim();

      outcome.totalCount += 1;
      outcome.emptyID1CCount = !id1C ? outcome.emptyID1CCount + 1 : outcome.emptyID1CCount;
      outcome.emptyPackagesCount = !packageName ? outcome.emptyPackagesCount + 1 : outcome.emptyPackagesCount;

      if (!id1C || !packageName || !primaryRegion) { outcome.incorrectUsers.push(jsonUser); return; }

      const sanitizedCustomer = sanitizeJSONCustomer(jsonUser);

      if (!sanitizedCustomer?.phone) {
        outcome.incorrectUsers.push(jsonUser);
        outcome.incorrectPhonesCount += 1;
        return;
      }

      // Avoid phone numbers duplicates
      if (sanitizedPhonesUniq.some((phone) => phone === sanitizedCustomer.phone)) {
        outcome.duplicatesByPhoneNumberCount += 1;
        outcome.duplicatesByPhoneNumber.push(jsonUser);
        return;
      } else { sanitizedPhonesUniq.push(sanitizedCustomer.phone); }

      // It's expected one region per 1 uploading JSON
      if (!outcome.region) outcome.region = sanitizedCustomer.primaryRegion;
    });

    stream.on('end', async () => {
      logger // eslint-disable-next-line
        .info(`${emoji.get('ballot_box_with_check')} [ExchangeService.inspectCustomers] Finished: ${outcome.totalCount}`);
      resolve(outcome);
    });

    fs.createReadStream(jsonPath).pipe(stream).pipe(es.mapSync((data) => data));
  });

  return promise;
};


const parseAndStreamCustomers = async (jsonPath, exchangeDataID) => {
  // eslint-disable-next-line
  logger.info(`[ExchangeService.parseAndStreamCustomers] Called. JSON path: ${jsonPath}. exchangeDataID: ${exchangeDataID}`);

  if (!jsonPath) return 0;

  const sanitizedPhonesUniq = [];
  const outcome = {
    region: '',
    totalCount: 0,
    successfulCount: 0,
    emptyPackagesCount: 0,
    emptyID1CCount: 0,
    incorrectPhonesCount: 0,
    duplicatesByPhoneNumberCount: 0,
    incorrectUsersCount: 0,
    incorrectUsers: [],
    duplicatesByPhoneNumber: [],
    results: [],
  };

  return new Promise((resolve) => {
    const stream = JSONStream.parse('*');

    stream.on('data', async (jsonUser) => {
      const id1C = jsonUser['??????'];
      const packageName = jsonUser['????????????']?.trim();
      const primaryRegion = jsonUser['????????????']?.trim();

      outcome.totalCount += 1;
      outcome.emptyID1CCount = !id1C ? outcome.emptyID1CCount + 1 : outcome.emptyID1CCount;
      outcome.emptyPackagesCount = !packageName ? outcome.emptyPackagesCount + 1 : outcome.emptyPackagesCount;

      if (!id1C || !packageName || !primaryRegion) {
        outcome.incorrectUsers.push(jsonUser);
        outcome.incorrectUsersCount += 1;
        return;
      }

      const sanitizedCustomer = sanitizeJSONCustomer(jsonUser);

      if (!sanitizedCustomer?.phone) {
        outcome.incorrectUsers.push(jsonUser);
        outcome.incorrectUsersCount += 1;
        outcome.incorrectPhonesCount += 1;
        return;
      }

      // Avoid phone numbers duplicates
      if (sanitizedPhonesUniq.some((phone) => phone === sanitizedCustomer.phone)) {
        outcome.duplicatesByPhoneNumberCount += 1;
        outcome.duplicatesByPhoneNumber.push(jsonUser);
        return;
      } else { sanitizedPhonesUniq.push(sanitizedCustomer.phone); }

      // It's expected one region per 1 uploading JSON
      if (!outcome.region) outcome.region = sanitizedCustomer.primaryRegion;

      stream.pause();
      const res = await update1CUser(sanitizedCustomer);

      if (res?.isOK) outcome.successfulCount += 1;
      outcome.results.push(res);

      stream.resume();
    });

    stream.on('end', async () => {
      logger // eslint-disable-next-line
        .info(`${emoji.get('ballot_box_with_check')} [ExchangeService.parseAndStreamCustomers] Finished: ${outcome.totalCount}`);

      // Send email
      if (NODE_ENV !== 'development') {
        const templatePath = getEmailTemplatePath('uploadUserDataResults.html');
        const replacements = {
          ...outcome,
          ...{ SITE_URL },
        };

        EmailService.sendCustomerUploadingResults(replacements, templatePath);
      }

      // Store exchange logs
      if (exchangeDataID) {
        const query = { _id: exchangeDataID };
        const updateDoc = { $set: { outcome } };
        const options = { new: true };

        await ExchangeStore.findOneAndUpdate(query, updateDoc, options);
        logger.info(`Updated ExchangeStore doc ID: ${exchangeDataID}`);
      }

      resolve(outcome);
    });

    fs.createReadStream(jsonPath).pipe(stream).pipe(es.mapSync((data) => data));
  });
};



const parseAndSaveDeliveryTypes = async (types) => {
  logger.info(`[ExchangeService.parseAndSaveDeliveryTypes] Called. Types count: ${types?.length}`);

  const result = {
    rejected: 0,
    successful: 0,
    total: types.length,
  };

  const outcome = await Promise.allSettled(
    types.map((item) => {
      const query = { code1C: item['??????'] };
      const updateDoc = {
        $set: {
          region: item['????????????'],
          type: item['??????????????????????'],
          city1C: {
            uk: item['????????????????????????????????'],
            ru: item['????????????????????????????????'],
          },
          addressLine1C: {
            uk: item['??????????????????????????????????'],
            ru: item['??????????????????????????????????'],
          },
          isOffice: item['????????'],
          code1C: item['??????'],
          updatedOn: new Date().toISOString(),
        },
      };

      const options = { new: true, upsert: true };

      const callback = (error) => {
        if (error) {
          logger.error(error);
          return { ...result, ...{ success: false, message: error.message || error.reason } };
        }
        return { ...result, ...{ success: true } };
      };

      return Delivery.findOneAndUpdate(query, updateDoc, options, callback);
    }),
  );

  outcome.filter(({ status }) => status === 'rejected').forEach((res) => {
    errorLogger(res.reason, { method: 'ExchangeService.parseAndSaveDeliveryTypes', url: NODE_ENV });
  });

  result.rejected = outcome.filter(({ status }) => status === 'rejected').length;
  result.successful = outcome.filter(({ status }) => status === 'fulfilled').length;

  if (STORE_DELIVERY_TYPES_EXCHANGE) {
    const createDoc = {
      name: 'delivery',
      data: types,
      rejectedRecords: { count: result.rejected },
      successfulRecords: { count: result.successful },
    };

    await ExchangeStore.create(createDoc, (error, doc) => {
      if (error) console.error('ExchangeStore, delivery error:', error);
      logger.info(`New ExchangeStore doc ID: ${doc?._id}`);
    });
  }

  logger.info(`[ExchangeService.parseAndSaveDeliveryTypes] Finished. Successful count: ${result.successful}`);
  return result;
};


const parseAndStreamItemsList = async (jsonPath) => {
  logger.info(`[ExchangeService.parseAndStreamItemsList] Called. JSON path: ${jsonPath}`);

  if (!jsonPath) return 0;

  const outcome = {
    region: '',
    types: {},
    priceList: {
      rejected: [],
      successful: [],
    },
    itemsWithNoDefaultPackagePrice: [],
    incorrectItems: [],
    incorrectItemsCount: 0,
    totalCount: 0,
  };

  const updatePriceListResult = async (key, payload) => outcome.priceList[`${key}`].push(payload);
  const updateTypesResult = async (key, payload) => outcome.types[`${key}`].push(payload);

  const updateResults = async (res) => {
    const { articleCode, type, priceListUpdate, itemTypeUpdate } = res;
    if (!Object.prototype.hasOwnProperty.call(outcome.types, type)) outcome.types[`${type}`] = [];

    if (priceListUpdate?._id) await updatePriceListResult('successful', articleCode);
    if (!priceListUpdate?._id && !priceListUpdate?.success) await updatePriceListResult('rejected', priceListUpdate);

    if (itemTypeUpdate?._id) await updateTypesResult(type, articleCode);
  };

  return new Promise((resolve) => {
    const stream = JSONStream.parse('*');

    stream.on('data', async (data) => {
      outcome.totalCount += 1;
      const isJsonItemFromMainRegion = data['????????????'] === defaultRegion;

      const item1C = {
        ...data,
        ...{ ??????????????: data['??????????????'].trim() },
      };

      // Validation
      if ((isJsonItemFromMainRegion && !is1CItemOfMainRegionValid(item1C))
      || (!isJsonItemFromMainRegion && !is1CItemValid(item1C))) {
        outcome.incorrectItemsCount += 1;
        const infoPointsToItem = data['??????????????'] || data['??????'] || data['????????????????????????'];
        outcome.incorrectItems.push(infoPointsToItem);
        return;
      }

      if (!outcome.region) outcome.region = item1C['????????????'];
      if (isDefaultPackagePriceEmpty(item1C)) outcome.itemsWithNoDefaultPackagePrice.push(item1C['??????????????']);

      const res = await processingOf1CItem(item1C);
      await updateResults(res);
      return res;
    });

    stream.on('end', async () => {
      logger // eslint-disable-next-line
        .info(`${emoji.get('ballot_box_with_check')} [ExchangeService.parseAndStreamItemsList] Finished: ${outcome.totalCount}`);

      // Report about missing prices via email
      if ((outcome.itemsWithNoDefaultPackagePrice.length || outcome.incorrectItemsCount)
        && NODE_ENV !== 'development') {
        const templatePath = getEmailTemplatePath('missingPricesForDefaultPackage.html');
        const replacements = {
          ...outcome,
          ...{
            SITE_URL,
            incorrectItems: Array.isArray(outcome.incorrectItems) ? outcome.incorrectItems.join(', ') : '',
            articleCodesWithEmptyDefaultPackagePrice: Array.isArray(outcome.itemsWithNoDefaultPackagePrice)
              ? outcome.itemsWithNoDefaultPackagePrice.join(', ') : '',
          },
        };
        EmailService.sendEmailAboutMissingPrices(replacements, templatePath);
      }

      // Store exchange logs
      if (STORE_ITEMS_LIST_EXCHANGE_RESULT) {
        const exchangeDataToSave = {
          name: 'items-list',
          data: outcome, // save full and stuctured outcome
          itemsWithNoDefaultPackagePrice: null,
          rejectedRecords: null,
          successfulRecords: null,
        };
        await ExchangeStore.create(exchangeDataToSave, (error) => {
          if (error) console.error('ExchangeStore items-list error:', error);
        });
      }

      resolve(outcome);
    });

    fs.createReadStream(jsonPath)
      .pipe(stream)
      .pipe(es.mapSync((data) => data));
  });
};



const updatePricesOfItem = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  const itemRegion = item1C['????????????'];
  const isJsonItemFromMainRegion = itemRegion === defaultRegion;

  const defaultPackageOfItemRegion = defaultPackagesByRegion
    .find((p) => p.region === itemRegion)?.packageName || defaultPackageOfDefaulRegion;

  const packages = item1C['????????']
    .filter((p) => Number(p['????????'].replace(',', '.')) > 0)
    .map((price) => ({
      price: Number(price['????????'].replace(',', '.')),
      packageName: price['????????????????????????'] || defaultPackageOfItemRegion,
    }));

  // Approach to avoid duplicates in json
  const packagesUniq = _.uniqBy(packages, 'packageName')
    .filter((p) => p.packageName !== '?????? ????????????????????????????????'); // Cleanup useless info

  if (!packagesUniq.length) return { ...result, ...{ message: 'Missing prices' } };

  const canBeHidden = isSideProfile(item1C) || (isFilling(item1C) && item1C['????????????????????????????????'] === '??????');

  const jsonItem = {
    region: itemRegion,
    articleCode: item1C['??????????????'],
    itemType: item1C['??????????????????????????????'],
    labelRu: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
    labelUk: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
    id1C: item1C['??????'],
    updatedOn: new Date().toISOString(),
    ...(canBeHidden ? { isHidden: Boolean(item1C['????????????????????']) } : {}),
    prices: packagesUniq,
  };

  // Find articleCode in all regions
  const dbItems = await PriceList.find({ articleCode: jsonItem.articleCode }).lean();

  // Find item by articleCode and itemRegion
  const dbItem = dbItems.find((i) => `${i.articleCode}` === `${jsonItem.articleCode}` && i.region === itemRegion);

  // Create or update item from main region
  if (isJsonItemFromMainRegion) {
    if (!dbItem) {
      return PriceList.create(jsonItem, (error) => {
        if (error) {
          logger.error(error);
          return { ...result, ...{ success: false, message: error.message || error.reason } };
        }
        return { ...result, ...{ success: true } };
      });
    }
    return PriceList
      .findOneAndUpdate({ _id: dbItem._id }, { $set: jsonItem }, { new: true }, (error) => {
        if (error) {
          logger.error(error);
          return { ...result, ...{ success: false, message: error.message || error.reason } };
        }
        return { ...result, ...{ success: true } };
      });
  }

  // Other region cases
  const dbItemWithArticleCodeFromMainRegion = dbItems
    .find((i) => `${i.articleCode}` === `${jsonItem.articleCode}` && i.region === defaultRegion);

  if (dbItem) {
    const jsonItemReduced = _.omit(jsonItem, ['labelRu', 'labelRu', 'itemType', 'id1C']);

    return PriceList
      .findOneAndUpdate({ _id: dbItem._id }, { $set: jsonItemReduced }, { new: true }, (error) => {
        if (error) {
          logger.error(error);
          return { ...result, ...{ success: false, message: error.message || error.reason } };
        }
        return { ...result, ...{ success: true } };
      });
  }

  // We can create new doc in DB from another region if it already exists in Lviv region
  if (!dbItem && dbItemWithArticleCodeFromMainRegion) {
    // merge jsonItem with dbItem fields (because we don't have all fields in secondary region's file)
    const itemToCreate = {
      ..._.omit(dbItemWithArticleCodeFromMainRegion, ['_id']),
      ...jsonItem,
      ...{ itemType: jsonItem.itemType || dbItemWithArticleCodeFromMainRegion.itemType },
    };

    return PriceList.create(itemToCreate, (error) => {
      if (error) {
        logger.error(error);
        return { ...result, ...{ success: false, message: error.message || error.reason } };
      }
      return { ...result, ...{ success: true } };
    });
  } else if (!dbItem && !dbItemWithArticleCodeFromMainRegion) {
    const message = `Cannot create item ${jsonItem.articleCode} because it doesn't exist in Lviv region`;
    return { ...result, ...{ success: false, message } };
  }
};



const updateSideProfile = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  let codeWithoutColor = item1C['??????????????'].includes('Slim')
    ? item1C['??????????????'].substring(item1C['??????????????'].lastIndexOf('-') + 1)
    : item1C['??????????????'].substring(item1C['??????????????'].indexOf('-') + 1);

  // These both are the same profile so we bring to a common standard
  if (codeWithoutColor === '119 v.p.') codeWithoutColor = '119-v.p.';

  if (!isSideProfileValid(codeWithoutColor)) return { ...result, ...{ message: 'Side profile is not valid' } };

  const dbSideProfile = await SideProfiles.findOne({ articleCode: codeWithoutColor })?.lean();
  const color = item1C['??????????????'].substring(0, item1C['??????????????'].indexOf('-'));

  // Images of profiles should be shown in one color on UI
  const image = color === defaultAluminiumColor ? item1C['????????????????????????????????'] : dbSideProfile?.image;

  const popularity = sideProfilesPopularity
    .find(({ sideProfile }) => sideProfile === codeWithoutColor)?.popularity || 0;

  const query = { articleCode: codeWithoutColor };
  const updateDoc = {
    $set: {
      articleCode: codeWithoutColor,
      labelRu: codeWithoutColor,
      labelUk: codeWithoutColor,
      image: image || logoPath,
      popularity,
      updatedOn: new Date().toISOString(),
    },
    $addToSet: { colorsDependence: color },
  };
  const options = { new: true, upsert: true };
  const callback = (error) => {
    if (error) {
      logger.error(error);
      return { ...result, ...{ success: false, message: error.message || error.reason } };
    }
    return { ...result, ...{ success: true } };
  };

  return SideProfiles.findOneAndUpdate(query, updateDoc, options, callback);
};



const updateConnectingProfile = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  const codeWithoutColor = item1C['??????????????'].substring(item1C['??????????????'].indexOf('-') + 1);
  const dbConnectingProfile = await ConnectingProfiles.findOne({ articleCode: codeWithoutColor })?.lean();
  const color = item1C['??????????????'].substring(0, item1C['??????????????'].indexOf('-'));

  // Images of profiles should be shown in one color on UI
  const image = color === defaultAluminiumColor ? item1C['????????????????????????????????'] : dbConnectingProfile?.image;

  const popularity = connectingProfilesPopularity
    .find(({ connectingProfile }) => connectingProfile === codeWithoutColor)?.popularity;

  const query = { articleCode: codeWithoutColor };
  const updateDoc = {
    $set: {
      articleCode: codeWithoutColor,
      labelRu: codeWithoutColor,
      labelUk: codeWithoutColor,
      image: image || logoPath,
      popularity,
      updatedOn: new Date().toISOString(),
    },
  };
  const options = { new: true, upsert: true };
  const callback = (error) => {
    if (error) {
      logger.error(error);
      return { ...result, ...{ success: false, message: error.message || error.reason } };
    }
    return { ...result, ...{ success: true } };
  };

  return ConnectingProfiles.findOneAndUpdate(query, updateDoc, options, callback);
};



const updateMechanism = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  const popularity = mechanismsPopularity.find(({ mechanism }) => mechanism === item1C['??????????????'])?.popularity;

  const query = { articleCode: item1C['??????????????'] };
  const updateDoc = {
    $set: {
      articleCode: item1C['??????????????'],
      popularity,
      labelRu: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      labelUk: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      image: item1C['????????????????????????????????'] || logoPath,
      updatedOn: new Date().toISOString(),
    },
  };
  const options = { new: true, upsert: true };
  const callback = (error) => {
    if (error) {
      logger.error(error);
      return { ...result, ...{ success: false, message: error.message || error.reason } };
    }
    return { ...result, ...{ success: true } };
  };

  return Mechanisms.findOneAndUpdate(query, updateDoc, options, callback);
};



const updateDoorLatchMechanism = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  const query = { articleCode: item1C['??????????????'] };
  const updateDoc = {
    $set: {
      articleCode: item1C['??????????????'],
      labelRu: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      labelUk: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      image: item1C['????????????????????????????????'] || logoPath,
      updatedOn: new Date().toISOString(),
    },
  };
  const options = { new: true, upsert: true };
  const callback = (error) => {
    if (error) {
      logger.error(error);
      return { ...result, ...{ success: false, message: error.message || error.reason } };
    }
    return { ...result, ...{ success: true } };
  };

  return DoorLatchMechanisms.findOneAndUpdate(query, updateDoc, options, callback);
};



const updateFilling = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  const query = { articleCode: item1C['??????????????'] };
  const updateDoc = {
    $set: {
      articleCode: item1C['??????????????'],
      labelRu: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      labelUk: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      fillingType: item1C['??????????????????????????????????????'] || item1C['????????????????????????????????'] || '',
      manufacturer: item1C['??????????????????????????'] || item1C['??????????????????????????????????????'] || '',
      mirrorType: item1C['????????????????????????????????????'] || '',
      chipboardThickness: item1C['????????????????????'] || '',
      size: item1C['??????????????????'] || '',
      stockKeepingUnit: item1C['??????????????????????????????'] || '',
      image: item1C['????????????????????????????????'] || logoPath,
      updatedOn: new Date().toISOString(),
    },
  };
  const options = { new: true, upsert: true };
  const callback = (error) => {
    if (error) {
      logger.error(error);
      return { ...result, ...{ success: false, message: error.message || error.reason } };
    }
    return { ...result, ...{ success: true } };
  };

  return Filling.findOneAndUpdate(query, updateDoc, options, callback);
};



const updateFillingFeature = async (item1C) => {
  const result = {
    articleCode: item1C['??????????????'],
    success: false,
    message: '',
  };

  if (_.isEmpty(item1C)) return result;

  const query = { articleCode: item1C['??????????????'] };
  const updateDoc = {
    $set: {
      articleCode: item1C['??????????????'],
      labelRu: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      labelUk: item1C['??????????????????????????????????????????'] || item1C['????????????????????????'],
      stockKeepingUnit: item1C['??????????????????????????????'] || '',
      image: item1C['????????????????????????????????'] || logoPath,
      updatedOn: new Date().toISOString(),
    },
  };
  const options = { new: true, upsert: true };
  const callback = (error) => {
    if (error) {
      logger.error(error);
      return { ...result, ...{ success: false, message: error.message || error.reason } };
    }
    return { ...result, ...{ success: true } };
  };

  return FillingFeatures.findOneAndUpdate(query, updateDoc, options, callback);
};



const processingOf1CItem = async (item1C) => {
  if (_.isEmpty(item1C)) return;

  let itemTypeUpdate = null;
  const priceListUpdate = await updatePricesOfItem(item1C);

  const result = {
    articleCode: item1C['??????????????'],
    type: item1C['??????????????????????????????']?.replace(/\s/g, '_') || 'empty_type',
    priceListUpdate,
    itemTypeUpdate,
  };

  // The reason we check for main (Lviv) region is to update only the prices for non-main regions
  const isMainRegion = item1C['????????????'] === defaultRegion;
  if (!isMainRegion) return result;

  if (isSideProfile(item1C)) itemTypeUpdate = await updateSideProfile(item1C);
  if (isConnectingProfile(item1C)) itemTypeUpdate = await updateConnectingProfile(item1C);
  if (isMechanism(item1C)) itemTypeUpdate = await updateMechanism(item1C);
  if (isDoorLatchMechanisms(item1C)) itemTypeUpdate = await updateDoorLatchMechanism(item1C);
  if (isFilling(item1C)) itemTypeUpdate = await updateFilling(item1C);
  if (isFillingFeature(item1C)) itemTypeUpdate = await updateFillingFeature(item1C);

  return { ...result, ...{ itemTypeUpdate } };
};



const update1CUser = async (sanitizedUser) => {
  const result = {
    ID: null,
    phone: null,
    phonePrev: null,
    id1C: null,
    id1CPrev: null,
    isOK: false,
    isNewUser: false,
    isPhoneChanged: false,
    isId1CChanged: false,
    id1CMatchIDs: [],
  };
  const { id1C, phone, primaryRegion } = sanitizedUser;

  // Looking for user by phone in all regions
  let dbUser = await Users.findOne({ phone }).lean();

  // Case when user is found by phone number
  if (dbUser?._id) {
    // Update id1C for this phone number
    const userToUpdate = {
      ...sanitizedUser,
      ...{
        id1C,
        regionsList: _.union(dbUser.regionsList, [primaryRegion])
          .filter((value, index, self) => self.indexOf(value) === index),
        updatedOn: new Date().toISOString(),
      },
    };

    const userQuery = { _id: dbUser._id };
    const updateUserDoc = { $set: userToUpdate };
    const userOptions = { new: true };
    const userCallback = (error) => { if (error) logger.error(error); };

    const user = await Users.findOne(userQuery);
    const updatedUser = await Users.findOneAndUpdate(userQuery, updateUserDoc, userOptions, userCallback);
    logger.info(`Updated id1C for ID: ${updatedUser?._id}`);

    result.ID = updatedUser?._id;
    result.id1C = updatedUser?.id1C;
    result.id1CPrev = user?.id1C;
    result.phone = phone;
    result.phonePrev = phone;
    result.isOK = !!updatedUser?._id;
    result.isId1CChanged = !!updatedUser?._id;

    // Remove this id1C from docs with other phone numbers in this region
    const id1CMatch = await Users
      .findOne({ _id: { $not: { $eq: dbUser._id } }, id1C, primaryRegion }).lean();

    if (!id1CMatch?.length) return result;

    const id1CMatchIDs = id1CMatch.map((match) => match._id);
    const id1CMatchQuery = { _id: { $in: id1CMatchIDs } };
    const updateId1CMatchDoc = { $set: { id1C: '', updatedOn: new Date().toISOString() } };
    const id1CMatchOptions = { new: true };
    const id1CMatchCallback = (error, res) => {
      if (error) logger.error('Removing id1C from doc failed:', error);
      else { console.log('Removed id1C from:', res); }
    };

    await Users.updateMany(id1CMatchQuery, updateId1CMatchDoc, id1CMatchOptions, id1CMatchCallback);

    result.id1CMatchIDs = id1CMatchIDs;
    return result;
  }

  // Looking for user by id1C in this region
  dbUser = await Users.findOne({ id1C, primaryRegion }).lean();

  // Create new user
  if (!dbUser?._id) {
    const userToCreate = {
      ...sanitizedUser,
      ...{
        phone: Long.fromString(`${phone}`),
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        isPhoneNumberVerified: false,
      },
    };

    await Users.create(userToCreate, (err, doc) => {
      if (err) console.error('Create new user failed:', err);
      logger.info(`New User doc ID: ${doc?._id}`);

      result.ID = doc?._id;
      result.id1C = doc?.id1C;
      result.phone = phone;
      result.isOK = !!doc?._id;
      result.isNewUser = !!doc?._id;
    });

    return result;
  }

  // Case when user is found by id1C in this region
  // Update phone number
  const userToUpdate = {
    ...sanitizedUser,
    ...{
      phone: Long.fromString(`${phone}`),
      isPhoneNumberVerified: false,
      regionsList: _.union(dbUser.regionsList, [primaryRegion])
        .filter((value, index, self) => self.indexOf(value) === index),
      updatedOn: new Date().toISOString(),
    },
  };

  const query = { _id: dbUser._id };
  const updateDoc = { $set: userToUpdate };
  const options = { new: true };
  const callback = (error) => { if (error) logger.error(error); };

  const user = await Users.findOne(query);
  const updatedUser = await Users.findOneAndUpdate(query, updateDoc, options, callback);
  logger.info(`Updated phone for ID: ${updatedUser?._id}`);

  result.ID = updatedUser?._id;
  result.id1C = updatedUser?.id1C;
  result.id1CPrev = updatedUser?.id1C;
  result.phone = phone;
  result.phonePrev = user?.phone;
  result.isOK = !!updatedUser?._id;
  result.isPhoneChanged = !!updatedUser?._id;

  return result;
};



export default {
  inspectCustomers,
  parseAndStreamCustomers,
  parseAndSaveDeliveryTypes,
  parseAndStreamItemsList,
};
