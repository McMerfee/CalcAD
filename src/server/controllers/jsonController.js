import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv-safe';

import logger from '../helpers/logger';
import errorLogger from '../helpers/errorLogger';
import authMiddleware from '../middlewares/auth';
import { ExchangeService, JsonService } from '../services';
import {
  ExchangeStore,
  Users,
} from '../db';

dotenv.config({ path: '.env' });

const router = express.Router();
const ENV = process.env.NODE_ENV || 'development';
const {
  STORE_CUSTOMERS_EXCHANGE = false,
} = process.env;

const UPLOAD_DIR = path.join(__dirname, '../../../public/zip/uploads/');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Upload JSON files from admin page
router.post('/apply-data-from-items-list-zip', authMiddleware, applyItemsListFromZIP);
router.post('/apply-data-from-items-list-json', authMiddleware, applyItemsListFromJSON);
router.put('/apply-data-from-customers-json', authMiddleware, applyDataFromCustomersJSON);

// 1C Exchange
router.put('/customers', uploadCustomersFrom1C);
router.put('/items-list', uploadItemsListFrom1C);
router.put('/delivery', uploadDeliveryDetailsFrom1C);

// Test data
router.post('/get-comparing-users-info', testAndCompareUsersJSONWithDBFile);


// Upload Items List JSON file from admin page
async function applyItemsListFromJSON(req, res) {
  try {
    const { fileContent } = req.body;

    if (req?.user?.role !== 'admin') return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });
    if (!fileContent) return res.status(400).send({ error: { message: 'FILE_NOT_FOUND' } });

    const fileName = `list_${new Date().valueOf()}`;
    const jsonPath = `public/zip/uploads/${fileName}.json`;

    const storedFile = await JsonService.storeFile(jsonPath, fileContent, 'utf8');
    if (!storedFile) return res.status(500).send({ error: { message: 'STORE_JSON_ERROR' } });

    const exploreItemsAndPricesDataResult = await JsonService.exploreItemsAndPricesData(jsonPath);
    res.send({ data: exploreItemsAndPricesDataResult });

    const streamPromiseResult = await JsonService.parseAndStreamItemsList(jsonPath);

    // Cleanup files
    if (streamPromiseResult === 'success') JsonService.removeFiles([jsonPath]);

    return res.end();
  } catch (err) {
    errorLogger(err, { method: 'applyItemsListFromJSON', url: ENV });
    return res.status(500).send(err);
  }
}


// Upload Items List JSON zipped file from admin page
async function applyItemsListFromZIP(req, res) {
  try {
    logger.info('[applyItemsListFromZIP] Called');

    const { zip } = req.body;

    if (req?.user?.role !== 'admin') return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });
    if (!zip) return res.status(400).send({ error: { message: 'ZIP_NOT_FOUND' } });

    const fileName = `list_${new Date().valueOf()}`;
    const zipPath = `public/zip/uploads/${fileName}.zip`;
    const jsonPath = `public/zip/uploads/${fileName}.json`;

    const unzipped = await JsonService.unzipItemsList(jsonPath, zipPath, zip);
    if (!unzipped) return res.status(500).send({ error: { message: 'UNZIP_ERROR' } });

    const exploreItemsAndPricesDataResult = await JsonService.exploreItemsAndPricesData(jsonPath);
    res.send({ data: exploreItemsAndPricesDataResult });

    const streamPromiseResult = await JsonService.parseAndStreamItemsList(jsonPath);

    // Cleanup files
    if (streamPromiseResult === 'success') JsonService.removeFiles([jsonPath, zipPath]);

    return res.end();
  } catch (err) {
    errorLogger(err, { method: 'applyItemsListFromZIP', url: ENV });
    return res.status(500).send(err);
  }
}


async function applyDataFromCustomersJSON(req, res) {
  try {
    const { fileContent } = req.body;
    const parsedData = JSON.parse(fileContent);
    const customers = parsedData?.['Контрагенты'];

    if (req?.user?.role !== 'admin') return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });
    if (!fileContent) return res.status(400).send({ error: { message: 'FILE_NOT_FOUND' } });

    const fileName = `customers_${new Date().valueOf()}`;
    const jsonPath = `public/zip/uploads/${fileName}.json`;

    const storedFile = await JsonService.storeFile(jsonPath, JSON.stringify(customers), 'utf8');
    if (!storedFile) return res.status(500).send({ error: { message: 'STORE_JSON_ERROR' } });

    let exchangeDataID = '';
    if (STORE_CUSTOMERS_EXCHANGE) {
      const dataToStore = {
        name: 'customers',
        data: parsedData,
      };

      await ExchangeStore.create(dataToStore, (err, doc) => {
        if (err) console.error('ExchangeStore, customers error:', err);
        exchangeDataID = doc?._id;
        logger.info(`New ExchangeStore doc ID: ${exchangeDataID}`);
      });
    }

    const outcome = await ExchangeService.inspectCustomers(jsonPath);

    const data = {
      region: outcome?.region,
      totalCustomersInFile: outcome?.totalCount,
      sanitizedCustomers: outcome?.totalCount - outcome?.incorrectPhonesCount,
      uniqPhones: outcome?.totalCount - outcome?.duplicatesByPhoneNumberCount,
      phoneNumbersAlreadyExist: outcome?.duplicatesByPhoneNumberCount,
    };
    res.send({ status: 200, data });

    await ExchangeService.parseAndStreamCustomers(jsonPath, exchangeDataID);

    // Cleanup files
    if (outcome.totalCount) JsonService.removeFiles([jsonPath]);

    return res.end();
  } catch (err) {
    errorLogger(err, { method: 'applyDataFromCustomersJSON', url: ENV });
    return res
      .status(500)
      .send({ message: err?.message || '[applyDataFromCustomersJSON] Error' });
  }
}


// Uploading from 1C or comand line
async function uploadCustomersFrom1C(req, res) {
  try {
    const fileContent = JSON.stringify(req.body?.['Контрагенты']);
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send('Invalid token');

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });
    if (!fileContent) return res.status(400).send({ error: { message: 'INVALID_JSON_DATA' } });

    const fileName = `customers_${new Date().valueOf()}`;
    const jsonPath = `public/zip/uploads/${fileName}.json`;

    const storedFile = await JsonService.storeFile(jsonPath, fileContent, 'utf8');
    if (!storedFile) return res.status(500).send({ error: { message: 'STORE_JSON_ERROR' } });

    let exchangeDataID = '';
    if (STORE_CUSTOMERS_EXCHANGE) {
      const dataToStore = {
        name: 'customers',
        data: req.body,
      };

      await ExchangeStore.create(dataToStore, (err, doc) => {
        if (err) console.error('ExchangeStore, customers error:', err);
        exchangeDataID = doc?._id;
        logger.info(`New ExchangeStore doc ID: ${exchangeDataID}`);
      });
    }

    const outcome = await ExchangeService.inspectCustomers(jsonPath);
    res.send(outcome);

    await ExchangeService.parseAndStreamCustomers(jsonPath, exchangeDataID);

    // Cleanup files
    if (outcome.totalCount) JsonService.removeFiles([jsonPath]);

    return res.end();
  } catch (err) {
    errorLogger(err, { method: 'uploadCustomersFrom1C', url: ENV });
    return res.status(500).send(err?.message);
  }
}

// Uploading from 1C or comand line
async function uploadItemsListFrom1C(req, res) {
  try {
    const fileContent = JSON.stringify(req.body?.['Номенклатура']);
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send('Invalid token');

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });
    if (!fileContent) return res.status(400).send({ error: { message: 'INVALID_JSON_DATA' } });

    const fileName = `list_${new Date().valueOf()}`;
    const jsonPath = `public/zip/uploads/${fileName}.json`;

    const storedFile = await JsonService.storeFile(jsonPath, fileContent, 'utf8');
    if (!storedFile) return res.status(500).send({ error: { message: 'STORE_JSON_ERROR' } });

    const outcome = await ExchangeService.parseAndStreamItemsList(jsonPath);

    // Cleanup files
    if (outcome.totalCount) JsonService.removeFiles([jsonPath]);

    const results = {
      region: outcome.region,
      total: outcome.totalCount,
      success: true,
      message: '',
    };
    if (outcome.itemsWithNoDefaultPackagePrice?.length) {
      results.message = `Позиції без роздрібної ціни (Львів): ${outcome.itemsWithNoDefaultPackagePrice}.`;
    }
    return res.send(results);
  } catch (err) {
    errorLogger(err, { method: 'uploadItemsListFrom1C', url: ENV });
    return res.status(500).send(err?.message);
  }
}


// Uploading from 1C or comand line
async function uploadDeliveryDetailsFrom1C(req, res) {
  try {
    const fileContent = req.body?.['Доставки'];
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send('Invalid token');

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });
    if (!fileContent || !fileContent?.length) return res.status(400).send({ error: { message: 'INVALID_JSON_DATA' } });

    const result = await ExchangeService.parseAndSaveDeliveryTypes(fileContent);

    if (!result.successful) return res.send({ status: 500, data: result });
    return res.send({ status: 200, data: result });
  } catch (err) {
    errorLogger(err, { method: 'uploadDeliveryDetailsFrom1C', url: ENV });
    return res.status(500).send(err?.message);
  }
}

async function testAndCompareUsersJSONWithDBFile(req, res) {
  try {
    const { collectionFilePath, data1CFilePath } = req.body;
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send('Invalid token');

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    if (!fs.existsSync(collectionFilePath) || !fs.existsSync(data1CFilePath)) {
      return res.status(400).send({ error: { message: 'FILE_NOT_FOUND' } });
    }

    const results = await JsonService.getComparingUsersInfoToTest(collectionFilePath, data1CFilePath);

    return res.send(results);
  } catch (err) {
    errorLogger(err, { method: 'getComparingUsersInfoToTest', url: ENV });
    return res
      .status(500)
      .send(err?.message);
  }
}



module.exports = router;
