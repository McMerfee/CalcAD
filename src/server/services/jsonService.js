import _ from 'lodash';
import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv-safe';
import unzip from 'unzip-stream';
import emoji from 'node-emoji';
import StreamObject from 'stream-json/streamers/StreamObject';

import logger from '../helpers/logger';
import errorLogger from '../helpers/errorLogger';
import { sanitizeItemsAndPricesJSON } from '../helpers/sanitizer';
import { getEmailTemplatePath } from '../helpers/emailsHelper';

import {
  defaultPackageName,
  defaultRegion,
  defaultPackagesByRegion,
} from '../helpers/constants';

import {
  isOldLogoPath,
  isSideProfileValid,
  isSideProfile,
  isConnectingProfile,
  isDoorLatchMechanisms,
  isMechanism,
} from '../helpers/validation';

import {
  sideProfilesPopularity,
  connectingProfilesPopularity,
  mechanismsPopularity,
} from '../helpers/itemsPopularity';

import {
  filterPriceListData,
  filterProfiles,
  filterFurnishing,
  filterFilling,
  filterFillingFeatures,
} from '../helpers/jsonHelper';

import {
  ConnectingProfiles,
  DoorLatchMechanisms,
  Filling,
  FillingFeatures,
  Mechanisms,
  PriceList,
  SideProfiles,
} from '../db';

import { EmailService } from './index';

require('mongoose-long')(mongoose);

dotenv.config({ path: '.env' });

const ENV = process.env.NODE_ENV || 'development';
const logoPath = '/src/client/assets/images/logo.png';
const { SITE_URL } = process.env;


// Get Articles With Empty Prices For Default Package
const getArticlesWithEmptyPrices = (data) => {
  logger.info('[JsonService.getArticlesWithEmptyPrices] Called');

  const itemHasDefaultPackage = (prices) => prices
    .filter((price) => price['Наименование'] === defaultPackageName)?.length;

  const hasEmptyDefaultPackagePrice = (prices) => prices.filter((price) => price['Наименование'] === defaultPackageName
    && !Number(price['Цена'].replace(',', '.')))?.length;

  const emptyPricesData = data
    .filter((item) => !_.isEmpty(item['Артикул']) && !_.isEmpty(item['Код'])
    && (_.isEmpty(item['Цены'])
      || !itemHasDefaultPackage(item['Цены']) || hasEmptyDefaultPackagePrice(item['Цены'])))
    .map((item) => item['Артикул']);

  logger.info('[JsonService.getArticlesWithEmptyPrices] Result:');
  logger.info(emptyPricesData.join(', '));

  return emptyPricesData || [];
};



const updateSideProfiles = async (profiles) => {
  logger.info(`[JsonService.updateSideProfiles] Called. Count: ${profiles?.length}`);
  if (!profiles?.length) return null;

  const images = [];
  let sideProfilesList = [];

  const colouredSideProfiles = profiles.filter((item) => isSideProfile(item));

  colouredSideProfiles.forEach((item) => {
    const profile = item['Артикул'].includes('Slim')
      ? item['Артикул'].substring(item['Артикул'].lastIndexOf('-') + 1)
      : item['Артикул'].substring(item['Артикул'].indexOf('-') + 1);

    if (!isSideProfileValid(profile)) return;

    if (item['Артикул'].includes('AS-')) images.push({ profile, image: item['СсылкаНаКартинку'] });

    sideProfilesList.push(profile);
  });

  sideProfilesList = _.uniq(sideProfilesList);

  const sideProfiles = sideProfilesList.map((sp) => {
    let codeWithoutColor = sp;
    const colorsDependence = colouredSideProfiles
      .filter((item) => item['Артикул'].includes(`-${codeWithoutColor}`))
      .map((item) => item['Артикул'].substring(0, item['Артикул'].indexOf('-')));
    const image = images.find((im) => im.profile === codeWithoutColor)?.image;

    if (codeWithoutColor === '119 v.p.') codeWithoutColor = '119-v.p.'; // The same side profile

    const popularity = sideProfilesPopularity.find((item) => item.sideProfile === codeWithoutColor)?.popularity;

    return {
      articleCode: codeWithoutColor,
      labelRu: codeWithoutColor,
      labelUk: codeWithoutColor,
      image: image && !isOldLogoPath(image) ? image : logoPath,
      colorsDependence,
      popularity,
      updatedOn: new Date().toISOString(),
    };
  });

  if (!sideProfiles.length) return null;

  const sp119vpGroup = _.groupBy(sideProfiles, (sp) => sp.articleCode)['119-v.p.'];
  let sp119vpToUpdate = [];

  if (sp119vpGroup?.length) {
    const sp119vpColors = sp119vpGroup
      .map((sp) => sp.colorsDependence)
      .flat()
      .filter((value, index, self) => self.indexOf(value) === index);
    const sp119vp = sideProfiles.filter((sp) => sp.articleCode === '119-v.p.') || [];
    sp119vpToUpdate = {
      ...sp119vp[0],
      ...sp119vp[1],
      ...{
        popularity: sp119vp[0].popularity || sp119vp[1].popularity,
        colorsDependence: sp119vpColors,
      },
    };

    _.remove(sideProfiles, (sp) => sp.articleCode === '119-v.p.');
  }

  const dbItems = await SideProfiles.find({}).lean();

  const awaits = _.union(sideProfiles, [sp119vpToUpdate]).map(async (sp) => {
    try {
      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${sp.articleCode}`);
      if (!dbItem) return SideProfiles.create(sp);

      return SideProfiles.findOneAndUpdate(
        { _id: dbItem._id },
        {
          $set: {
            articleCode: sp.articleCode,
            labelRu: sp.labelRu,
            labelUk: sp.labelUk,
            image: sp.image,
            popularity: sp.popularity || dbItem.popularity,
            colorsDependence: sp.colorsDependence,
            updatedOn: new Date().toISOString(),
          },
        },
        { new: true },
      );
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updateSideProfiles', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} SideProfiles updates: ${fulfilled}`);
  return fulfilled;
};



const updateConnectingProfiles = async (profiles) => {
  logger.info(`[JsonService.updateConnectingProfiles] Called. Count: ${profiles?.length}`);
  if (!profiles?.length) return null;

  const images = [];
  let connectingProfilesList = [];

  profiles
    .filter((item) => isConnectingProfile(item))
    .forEach((item) => {
      const cProfile = item['Артикул'].substring(item['Артикул'].indexOf('-') + 1);
      if (item['Артикул'].includes('AS-')) {
        images.push({ profile: cProfile, image: item['СсылкаНаКартинку'] });
      }
      connectingProfilesList.push(cProfile);
    });

  connectingProfilesList = _.uniq(connectingProfilesList);

  const connectingProfiles = connectingProfilesList.map((codeWithoutColor) => {
    const image = images.find((im) => im.profile === codeWithoutColor)?.image;
    const popularity = connectingProfilesPopularity
      .find((item) => item.connectingProfile === codeWithoutColor)?.popularity;

    return {
      articleCode: codeWithoutColor,
      labelRu: codeWithoutColor,
      labelUk: codeWithoutColor,
      image: image && !isOldLogoPath(image) ? image : logoPath,
      popularity,
      updatedOn: new Date().toISOString(),
    };
  });

  connectingProfiles.push({
    articleCode: 'invisible',
    labelRu: 'Без видимой перемычки',
    labelUk: 'Без видимої перемички',
    image: logoPath,
  });

  const dbItems = await ConnectingProfiles.find({}).lean();
  const awaits = connectingProfiles.map(async (cp) => {
    try {
      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${cp.articleCode}`);

      if (!dbItem) return ConnectingProfiles.create(cp);

      return ConnectingProfiles.findOneAndUpdate({ _id: dbItem._id }, cp, { new: true });
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updateConnectingProfiles', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} ConnectingProfiles updates: ${fulfilled}`);
  return fulfilled;
};



const updatePriceList = async (dataForPriceList) => {
  logger.info(`[JsonService.updatePriceList] Called. Count: ${dataForPriceList?.length}`);
  if (!dataForPriceList?.length) return null;

  const jsonItems = dataForPriceList
    .map((item) => {
      const region = item['Регион'] || defaultRegion;
      const defaultRegionPackage = defaultPackagesByRegion.find((p) => p.region === region)?.packageName
        || defaultPackageName;

      // Approach to avoid duplicates in json
      const packagesUniq = [];
      item['Цены']
        .filter((p) => Number(p['Цена'].replace(',', '.')) > 0)
        .map((price) => ({
          price: Number(price['Цена'].replace(',', '.')),
          packageName: price['Наименование'] || defaultRegionPackage,
        }))
        .map((x) => {
          if (!packagesUniq.some((y) => y.packageName === x.packageName)) {
            packagesUniq.push(x);
          }
          return x;
        });

      return {
        region: item['Регион'] || defaultRegion,
        articleCode: item['Артикул'],
        itemType: item['ТипНоменклатуры'],
        labelRu: item['НаименованиеНаСайтРос'] || item['Наименование'],
        labelUk: item['НаименованиеНаСайтУкр'] || item['Наименование'],
        id1C: item['Код'],
        updatedOn: new Date().toISOString(),
        prices: packagesUniq,
      };
    })
    .filter((item) => item.prices?.length);

  if (!jsonItems.length) return null;

  const dbItems = await PriceList.find({
    articleCode: { $in: jsonItems.map((item) => item.articleCode).filter((x) => x) },
  }).lean();

  const awaits = jsonItems.map(async (jsonItem) => {
    try {
      const isJsonItemFromMainRegion = jsonItem.region === defaultRegion;

      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${jsonItem.articleCode}`
        && `${i.region}` === `${jsonItem.region}`);

      // Create or update item from main region
      if (isJsonItemFromMainRegion) {
        if (!dbItem) return PriceList.create(jsonItem);
        return PriceList.findOneAndUpdate({ _id: dbItem._id }, { $set: jsonItem }, { new: true });
      }

      // Other region cases
      const dbItemWithArticleCodeFromMainRegion = dbItems
        .find((i) => `${i.articleCode}` === `${jsonItem.articleCode}` && `${i.region}` === defaultRegion);

      const jsonItemReduced = _.omit(jsonItem, ['labelRu', 'labelRu', 'itemType', 'id1C']);

      if (dbItem) return PriceList.findOneAndUpdate({ _id: dbItem._id }, { $set: jsonItemReduced }, { new: true });

      // We can create new doc in DB from another region if it already exists in Lviv region
      if (!dbItem && dbItemWithArticleCodeFromMainRegion) {
        // merge jsonItem with dbItem fields (because we don't have all fields in secondary region's file)
        const itemToCreate = {
          ..._.omit(dbItemWithArticleCodeFromMainRegion, ['_id']),
          ...jsonItem,
          ...{ itemType: jsonItem.itemType || dbItemWithArticleCodeFromMainRegion.itemType },
        };

        return PriceList.create(itemToCreate);
      } else if (!dbItem && !dbItemWithArticleCodeFromMainRegion) {
        logger.info(`Cannot create item ${jsonItem.articleCode} because it doesn't exist in Lviv region`);
      }
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updatePriceList', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} PriceList updates: ${fulfilled}`);
  return fulfilled;
};



const updateMechanisms = async (furnishing) => {
  logger.info(`[JsonService.updateMechanisms] Called. Count: ${furnishing?.length}`);
  if (!furnishing?.length) return null;

  const mechanisms = furnishing
    .filter((item) => isMechanism(item))
    .map((mechanism) => {
      const articleCode = mechanism['Артикул'];
      const popularity = mechanismsPopularity.find((item) => item.mechanism === articleCode)?.popularity;

      return {
        articleCode,
        popularity,
        labelRu: mechanism['НаименованиеНаСайтРос'] || mechanism['Наименование'],
        labelUk: mechanism['НаименованиеНаСайтУкр'] || mechanism['Наименование'],
        image: mechanism['СсылкаНаКартинку'] || logoPath,
        updatedOn: new Date().toISOString(),
      };
    });

  if (!mechanisms.length) return null;

  const dbItems = await Mechanisms.find({}).lean();
  const awaits = mechanisms.map(async (m) => {
    try {
      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${m.articleCode}`);

      if (!dbItem) return Mechanisms.create(m);

      return Mechanisms.findOneAndUpdate({ _id: dbItem._id }, m, { new: true });
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updateMechanisms', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} Mechanisms updates: ${fulfilled}`);
  return fulfilled;
};



const updateDoorLatchMechanisms = async (furnishing) => {
  logger.info(`[JsonService.updateDoorLatchMechanisms] Called. Count: ${furnishing?.length}`);
  if (!furnishing?.length) return null;

  const mechanisms = furnishing
    .filter((item) => isDoorLatchMechanisms(item))
    .map((mechanism) => ({
      articleCode: mechanism['Артикул'],
      labelRu: mechanism['НаименованиеНаСайтРос'] || mechanism['Наименование'],
      labelUk: mechanism['НаименованиеНаСайтУкр'] || mechanism['Наименование'],
      image: mechanism['СсылкаНаКартинку'] || logoPath,
      updatedOn: new Date().toISOString(),
    }));

  if (!mechanisms.length) return null;

  const dbItems = await DoorLatchMechanisms.find({}).lean();
  const awaits = mechanisms.map(async (m) => {
    try {
      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${m.articleCode}`);

      if (!dbItem) return DoorLatchMechanisms.create(m);

      return DoorLatchMechanisms.findOneAndUpdate({ _id: dbItem._id }, m, { new: true });
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updateDoorLatchMechanisms', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} DoorLatchMechanisms updates: ${fulfilled}`);
  return fulfilled;
};



const updateFilling = async (filling) => {
  logger.info(`[JsonService.updateFilling] Called. Count: ${filling?.length}`);
  if (!filling?.length) return null;

  const fillingItems = filling
    .map((item) => ({
      articleCode: item['Артикул'],
      labelRu: item['НаименованиеНаСайтРос'] || item['Наименование'],
      labelUk: item['НаименованиеНаСайтУкр'] || item['Наименование'],
      fillingType: item['КатегорияНаполнения'] || item['допТипНаполнения'] || '',
      manufacturer: item['Производитель'] || item['КатегорияНаполнения'] || '',
      mirrorType: item['ТипСтекломатериала'] || '',
      chipboardThickness: item['ТолщинаДСП'] || '',
      size: item['ФорматДСП'] || '',
      stockKeepingUnit: item['ЕдиницаХранения'] || '',
      image: item['СсылкаНаКартинку'] || logoPath,
      updatedOn: new Date().toISOString(),
    }));

  if (!fillingItems.length) return null;

  const dbItems = await Filling.find({}).lean();
  const awaits = fillingItems.map(async (f) => {
    try {
      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${f.articleCode}`);

      if (!dbItem) return Filling.create(f);

      return Filling.findOneAndUpdate({ _id: dbItem._id }, f, { new: true });
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updateFilling', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} Filling updates: ${fulfilled}`);
  return fulfilled;
};



const updateFillingFeatures = async (fillingFeatures) => {
  logger.info(`[JsonService.updateFillingFeatures] Called. Count: ${fillingFeatures?.length}`);
  if (!fillingFeatures?.length) return null;

  const featureItems = fillingFeatures
    .map((item) => ({
      articleCode: item['Артикул'],
      labelRu: item['НаименованиеНаСайтРос'] || item['Наименование'],
      labelUk: item['НаименованиеНаСайтУкр'] || item['Наименование'],
      stockKeepingUnit: item['ЕдиницаХранения'] || '',
      image: item['СсылкаНаКартинку'] || logoPath,
      updatedOn: new Date().toISOString(),
    }));

  if (!featureItems.length) return null;

  const dbItems = await FillingFeatures.find({}).lean();
  const awaits = featureItems.map(async (f) => {
    try {
      const dbItem = dbItems.find((i) => `${i.articleCode}` === `${f.articleCode}`);

      if (!dbItem) return FillingFeatures.create(f);

      return FillingFeatures.findOneAndUpdate({ _id: dbItem._id }, f, { new: true });
    } catch (err) {
      errorLogger(err, { method: 'JsonService.updateFillingFeatures', url: ENV });
    }
    return 1;
  });
  const result = await Promise.allSettled(awaits);
  const fulfilled = result.filter(({ status }) => status === 'fulfilled').length;

  logger.info(`${emoji.get('tada')} FillingFeatures updates: ${fulfilled}`);
  return fulfilled;
};



const storeFile = async (filePath, data, encoding) => {
  logger.info('[JsonService.storeFile] Called');

  if (_.isEmpty(data) || !filePath) return 0;

  const buffer = Buffer.from(data, encoding);

  await fs.promises
    .writeFile(filePath, buffer)
    .then(() => {
      logger.info(`${emoji.get('ballot_box_with_check')} File has been written successfully: ${filePath}`);
    });
  return 1;
};



const unzipItemsList = async (jsonPath, zipPath, zip) => {
  logger.info('[JsonService.unzipItemsList] Called');

  if (_.isEmpty(zip) || !jsonPath || !zipPath) return 0;

  const storedZip = await storeFile(zipPath, zip, 'base64');
  if (!storedZip) return 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzip.Parse())
      .on('entry', (entry) => {
        const { path } = entry;
        const isJSON = !path.startsWith('__MACOSX') && (path.endsWith('.JSON') || path.endsWith('.json'));
        if (isJSON) {
          entry.pipe(fs.createWriteStream(jsonPath));
        } else {
          entry.autodrain();
        }
      })
      .on('error', (err) => {
        logger.info(`${emoji.get('x')} File unzipping has failed: ${jsonPath}`);
        reject(err);
      })
      .on('finish', () => {
        logger.info(`${emoji.get('ballot_box_with_check')} File has been unzipped successfully: ${jsonPath}`);
        resolve(jsonPath);
      });
  });
};



const removeFiles = async (files) => {
  logger.info('[JsonService.removeFiles] Called');
  if (!Array.isArray(files)) return 0;

  return new Promise((resolve, reject) => {
    files.forEach((file) => {
      fs.stat(file, (err) => {
        if (err) { reject(err); }

        fs.unlink(file, (error) => {
          if (error) reject(err);
          logger.info(`${emoji.get('ballot_box_with_check')} File deleted successfully: ${file}`);
          resolve(file);
        });
      });
    });
  });
};



const parseAndStreamItemsList = async (jsonPath) => {
  logger.info(`[JsonService.parseAndStreamItemsList] Called. JSON path: ${jsonPath}`);

  if (!jsonPath) return 0;

  return new Promise((resolve, reject) => {
    const jsonStream = StreamObject.withParser();
    jsonStream.on('data', async ({ value }) => {
      const data = sanitizeItemsAndPricesJSON(value, false);

      if (!data?.length) {
        logger.info(`${emoji.get('x')} Invalid json data: ${jsonPath}`);
        reject(new Error('Invalid json data'));
      }

      await updateSideProfiles(filterProfiles(data));
      await updateConnectingProfiles(filterProfiles(data));
      await updateMechanisms(filterFurnishing(data));
      await updateDoorLatchMechanisms(filterFurnishing(data));
      await updateFilling(filterFilling(data));
      await updateFillingFeatures(filterFillingFeatures(data));
      await updatePriceList(filterPriceListData(data));
    });

    jsonStream.on('end', () => {
      logger.info(`${emoji.get('ballot_box_with_check')} parseAndStreamItemsList has been finished`);
      resolve('success');
    });

    fs.createReadStream(jsonPath).pipe(jsonStream.input);
  });
};



const exploreItemsAndPricesData = async (jsonPath) => {
  logger.info(`[JsonService.exploreItemsAndPricesData] Called. JSON path: ${jsonPath}`);

  const result = {
    region: '',
    priceList: 0,
    profilesTotal: 0,
    furnishing: 0,
    filling: 0,
    fillingFeatures: 0,
    itemsWithNoDefaultPackagePrice: 0,
  };
  let itemsWithEmptyDefaultPackagePrice = [];

  return new Promise((resolve, reject) => {
    const jsonStream = StreamObject.withParser();

    jsonStream.on('data', ({ value }) => {
      const data = sanitizeItemsAndPricesJSON(value, false);

      if (!data?.length) {
        logger.info(`${emoji.get('x')} Invalid json data: ${jsonPath}`);
        reject(new Error('Invalid json data'));
      }

      const dataForPriceList = filterPriceListData(data);
      const profiles = filterProfiles(data);
      const furnishing = filterFurnishing(data);
      const filling = filterFilling(data);
      const fillingFeatures = filterFillingFeatures(data);
      const region = dataForPriceList && dataForPriceList[0]?.['Регион'];
      const isMainRegion = region === defaultRegion;

      itemsWithEmptyDefaultPackagePrice = isMainRegion
        ? _.union(itemsWithEmptyDefaultPackagePrice, getArticlesWithEmptyPrices(data))
          .filter((val, index, self) => self.indexOf(val) === index)
        : [];

      result.region = region;
      result.priceList += dataForPriceList.length;
      result.profilesTotal += profiles.length;
      result.furnishing += furnishing.length;
      result.filling += filling.length;
      result.fillingFeatures += fillingFeatures.length;
    });

    jsonStream.on('end', () => {
      logger.info(`${emoji.get('ballot_box_with_check')} exploreItemsAndPricesData has been finished:`);
      logger.info(result);
      result.itemsWithEmptyDefaultPackagePrice = itemsWithEmptyDefaultPackagePrice;

      if (itemsWithEmptyDefaultPackagePrice.length && ENV !== 'development') {
        // Send email
        const templatePath = getEmailTemplatePath('missingPricesForDefaultPackage.html');
        const replacements = {
          ...result,
          ...{
            SITE_URL,
            articleCodesWithEmptyDefaultPackagePrice: Array.isArray(result.itemsWithEmptyDefaultPackagePrice)
              ? result.itemsWithEmptyDefaultPackagePrice.join(', ') : '',
          },
        };
        EmailService.sendEmailAboutMissingPrices(replacements, templatePath);
      }
      resolve(result);
    });

    fs.createReadStream(jsonPath).pipe(jsonStream.input);
  });
};


const getComparingUsersInfoToTest = async (collectionFilePath, data1CFilePath) => {
  logger.info(`[JsonService.parseAndStreamItemsList] Called.
  Collection path: ${collectionFilePath}. JSON path: ${data1CFilePath}`);

  if (!collectionFilePath || !data1CFilePath) return { error: { message: 'FILE_PATH_IS_MISSING' } };

  const result = [];
  const notValid = [];
  const notEqualList = [];
  let usersDB = [];
  let users1C = [];

  await new Promise((resolve, reject) => {
    const collectionStream = StreamObject.withParser();

    collectionStream.on('data', ({ value }) => {
      usersDB = value;

      if (!usersDB?.length) {
        logger.info(`${emoji.get('x')} Invalid json data: ${collectionFilePath}`);
        reject(new Error('Invalid json data'));
      }
    });

    collectionStream.on('end', () => resolve(result));
    fs.createReadStream(collectionFilePath).pipe(collectionStream.input);
  });

  await new Promise((resolve, reject) => {
    const data1CStream = StreamObject.withParser();

    data1CStream.on('data', ({ value }) => {
      users1C = value;

      if (!users1C?.length) {
        logger.info(`${emoji.get('x')} Invalid json data: ${data1CFilePath}`);
        reject(new Error('Invalid json data'));
      }
    });

    data1CStream.on('end', () => resolve(result));
    fs.createReadStream(data1CFilePath).pipe(data1CStream.input);
  });

  const awaits = users1C.map(async (jsonUser) => {
    try {
      const defaultPackage = defaultPackagesByRegion.find((p) => p.region === jsonUser['Регион'])?.packageName
        || defaultPackageName;

      const jsonUserPnone = parseInt(jsonUser['Телефоны'].filter((p) => {
        const phone = p.replace(/[^0-9]+/g, '');

        return phone.length === 10
          || (phone.length === 11 && phone.startsWith('8'))
          || (phone.length === 12 && phone.startsWith('38'));
      })[0], 10);

      if (isNaN(jsonUserPnone)) {
        notValid.push(jsonUser);
        return;
      }

      const dbUser = usersDB.find(({ primaryRegion, id1C, phone }) => (primaryRegion === jsonUser['Регион']
        && id1C === `${jsonUser['Код']}`) || (primaryRegion === jsonUser['Регион'] && phone === jsonUserPnone));

      const isEqual = jsonUser['Код'] === dbUser?.id1C && jsonUserPnone === dbUser?.phone
        && (jsonUser['ТипЦен'] || defaultPackage) === dbUser?.packageName;

      const dataToSend = {
        is_equal: isEqual,
        id1C_1C: jsonUser['Код'],
        id1C_mongo: dbUser?.id1C,
        phone_1C: jsonUserPnone,
        phone_mongo: dbUser?.phone,
        package_1C: jsonUser['ТипЦен'] || defaultPackage,
        package_mongo: dbUser?.packageName,
        name_1C: jsonUser['Наименование'],
        first_name_mongo: dbUser?.firstName,
        last_name_mongo: dbUser?.lastName,
      };

      if (!isEqual) notEqualList.push(jsonUser['Код']);

      result.push(dataToSend);

      return jsonUser;
    } catch (err) {
      errorLogger(err, { method: 'JsonService.getComparingUsersInfoToTest', url: ENV });
    }
    return 1;
  });
  await Promise.allSettled(awaits);

  return { notValid, notEqualList, result };
};



export default {
  getArticlesWithEmptyPrices,
  updateSideProfiles,
  updateConnectingProfiles,
  updatePriceList,
  updateMechanisms,
  updateDoorLatchMechanisms,
  updateFilling,
  updateFillingFeatures,
  storeFile,
  unzipItemsList,
  removeFiles,
  parseAndStreamItemsList,
  exploreItemsAndPricesData,
  getComparingUsersInfoToTest,
};
