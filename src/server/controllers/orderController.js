import _ from 'lodash';
import express from 'express';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import PdfPrinter from 'pdfmake/src/printer';
import dotenv from 'dotenv-safe';


import { SpecService } from '../../client/services';
import { defaultPackageName } from '../../client/helpers/constants';

import { regionsValuesList, PDF_FONTS } from '../helpers/constants';
import { generateSpecification } from '../helpers/pdf';
import { verifyToken } from '../helpers/jwt';
import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';
import { getNextSequence } from '../helpers/sequence';

import {
  EmailService,
  OrderService,
} from '../services';

import {
  ExchangeStore,
  Orders,
  PriceList,
  Users,
} from '../db';

dotenv.config({ path: '.env' });
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const router = express.Router();

const {
  NODE_ENV = 'development',
  STORE_ORDERS_STATUSES_EXCHANGE = false,
} = process.env;

router.post('/', createOrder);
router.post('/:orderId/copy', copyOrder);

router.put('/:orderId/update', updateOrder);
router.put('/:orderId/update/title', updateOrderTitle);
router.put('/:orderId/put-into-work', putOrderIntoWork);

router.delete('/:orderId/delete', deleteOrderById);

router.get('/:userId/:orderId/pdf', getPDFByUserIdAndOrderId);
router.get('/:orderId/pdf/:token', getPDFByOrderIdAndToken);
router.get('/:orderId', getOrderById);
router.get('/:orderId/put-into-work-lead-up', getOrderModalData);
router.get('/:userId/list/accepted', getUserAcceptedOrdersList);
router.get('/:userId/list/saved', getUserSavedOrdersList);

// 1C Exchange
router.get('/1c/in-processing/:region', exchangeOrdersWith1CByRegion);
router.get('/1c/in-processing/:region/test', exchangeOrdersWith1CByRegionTest); // Test
router.get('/1c/raw/:region', dumpOrdersFor1CByRegion);
router.put('/1c/statuses', updateOrdersDataFrom1C);
router.patch('/1c/set-exchanged', setOrdersExchanged);


async function createOrder(req, res) {
  try {
    const {
      userId,
      data,
      region,
      doorsSnippet,
      systemType,
    } = req.body;

    if (_.isEmpty(userId) || _.isEmpty(systemType)) {
      return res.status(400).send({ error: { message: 'BAD_REQUEST' } });
    }

    const user = await Users
      .findOne({ _id: userId })
      .select({
        firstName: 1,
        lastName: 1,
        phone: 1,
        primaryRegion: 1,
        delivery: 1,
        packageName: 1,
      })
      .lean();

    if (!user) return res.status(404).send({ error: { message: 'USER_NOT_FOUND' } });

    const orderNumber = await getNextSequence('orderNumber');
    const userFullName = `${user.firstName} ${user.lastName}`;
    const orderToCreate = {
      ...data,
      ...{
        systemType,
        orderNumber,
        doorsSnippet,
        packageName: user.packageName || defaultPackageName,
        title: data.title || '',
        status: 'new',
        user: {
          userId,
          region: region || user.primaryRegion,
          phoneNumber: user.phone,
          fullName: userFullName,
        },
      },
    };

    const order = new Orders(orderToCreate);
    await order.save();
    logger.info(`Order has been created: ID: ${order._id}, number: ${order._id}. User ID: ${req.user?.userId}`);

    return res.send({
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    errorLogger(err, { method: 'createOrder', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function copyOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { userId, title } = req.body;

    if (_.isEmpty(userId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const user = await Users
      .findOne({ _id: userId })
      .select({ _id: 1 })
      .lean();

    if (!user) return res.status(404).send({ error: { message: 'USER_NOT_FOUND' } });

    const orderDB = await Orders
      .findOne({
        _id: orderId,
        'user.userId': userId,
      })
      .lean();

    const orderNumber = await getNextSequence('orderNumber');
    const orderToCreate = {
      ..._.omit(orderDB, '_id'),
      ...{
        status: 'new',
        orderNumber,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        title: title || '',
      },
    };

    const order = new Orders(orderToCreate);
    await order.save();
    logger.info(`Order has been copied: ID: ${order._id}, number: ${order.orderNumber}. User ID: ${req.user?.userId}`);

    return res.send({
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    errorLogger(err, { method: 'copyOrder', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function updateOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { userId, data, region } = req.body;

    if (_.isEmpty(userId) || _.isEmpty(orderId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const user = await Users
      .findOne({ _id: userId })
      .select({
        firstName: 1,
        lastName: 1,
        phone: 1,
        primaryRegion: 1,
        delivery: 1,
        packageName: 1,
      })
      .lean();

    if (!user) return res.status(404).send({ error: { message: 'USER_NOT_FOUND' } });

    const updatedOrder = await Orders
      .findOneAndUpdate(
        {
          _id: orderId,
          'user.userId': userId,
        },
        {
          ...data,
          ...{
            status: 'new',
            packageName: user.packageName || defaultPackageName,
            user: {
              userId,
              region: region || user.primaryRegion,
              phoneNumber: user.phone,
              fullName: `${user.firstName} ${user.lastName}`,
            },
          },
        },
        { new: true },
      );

    if (!updatedOrder) {
      return res
        .status(500)
        .send({ error: { message: 'ERROR_UPDATING_ORDER' } });
    }

    logger.info(`Order has been updated: ${orderId}. User ID: ${req.user?.userId}`);

    return res.send({
      orderId,
      number1C: updatedOrder.number1C,
      orderNumber: updatedOrder.orderNumber,
      isUpdated: !!updatedOrder,
    });
  } catch (err) {
    errorLogger(err, { method: 'updateOrder', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function putOrderIntoWork(req, res) {
  try {
    const { orderId } = req.params;
    const { userId, data } = req.body;
    const { items: itemsRecalculated, totalPrice, retailTotalPrice } = data;

    if (_.isEmpty(userId) || _.isEmpty(orderId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const user = await Users
      .findOne({ _id: userId })
      .select({
        firstName: 1,
        lastName: 1,
        phone: 1,
        primaryRegion: 1,
        delivery: 1,
      })
      .lean();

    if (!user) return res.status(404).send({ error: { message: 'USER_NOT_FOUND' } });

    // Set data for exchanging with 1C
    const orderDB = await Orders.findOne({ _id: orderId, 'user.userId': userId }).lean();
    const items = itemsRecalculated?.length ? itemsRecalculated : orderDB.items;

    const articleCodesNotInExchange = ['pak_n', 'pak_d', 'pak_sl', 'pak_dl'];
    const featureArticleCodes = _.uniq(items
      .filter((x) => x.item === 'fillingFeature')
      .map((x) => x.articleCode));

    let itemsToUpdate = items
      .map((item) => {
        const exchange1C = {
          ID: SpecService.generateIDForExchange(),
          FID: SpecService.generateIDForExchange(true),
        };

        // ! 'work' item is still without articleCode, we're waiting for this field
        // TODO: remove the following part when we got articleCode of 'work'
        if (item.item === 'work') {
          return {
            ...item,
            ...{ exchange1C },
          };
        }

        if (_.isEmpty(item.articleCode) || _.some(articleCodesNotInExchange, (x) => x === item.articleCode)) {
          return item;
        }

        return {
          ...item,
          ...{ exchange1C },
        };
      });

    // Looking for features of fillings to make a reference
    itemsToUpdate = itemsToUpdate
      .map((item) => {
        if (!_.some(featureArticleCodes, (x) => x === item.articleCode)) return item;

        const getDoorIndex = (el) => (el.position && el.position.doorIndex ? el.position.doorIndex : 0);
        const getSectionIndex = (el) => (el.position && el.position.sectionIndex ? el.position.sectionIndex : 0);

        // Filling of current feature
        const itemOfInterest = itemsToUpdate.find((x) => x.articleCode !== item.articleCode
          && x.item === 'filling'
          && getDoorIndex(x) === getDoorIndex(item)
          && getSectionIndex(x) === getSectionIndex(item));

        if (!itemOfInterest) return item;

        return {
          ...item,
          ...{
            exchange1C: {
              ID: SpecService.generateIDForExchange(true),
              FID: itemOfInterest.exchange1C.ID, // FID points to its filling
            },
          },
        };
      });

    const query = { _id: orderId, 'user.userId': userId };
    const updateDoc = {
      $set: {
        items: itemsToUpdate,
        status: 'in-processing',
        comments: { customer: data?.delivery?.customerComment || '' },
        totalPrice: totalPrice || orderDB?.totalPrice,
        retailTotalPrice: retailTotalPrice || orderDB?.retailTotalPrice,
        delivery: {
          deliveryType: data?.delivery?.deliveryType || '',
          office: data?.delivery?.office || '',
          addressLine: data?.delivery?.addressLine || '',
          city: data?.delivery?.city || '',
          code1C: data?.delivery?.code1C || '',
        },
      },
    };
    const options = { new: true, upsert: true };
    const callback = (error) => { if (error) logger.error(error); };

    const putIntoWork = await Orders.findOneAndUpdate(query, updateDoc, options, callback);

    if (!putIntoWork?._id) {
      return res.status(500).send({ error: { message: 'ERROR_UPDATING_ORDER' } });
    }

    logger.info(`Order has been put into work: ID ${orderId}. User ID: ${req.user?.userId}`);
    if (NODE_ENV !== 'development') EmailService.sendNewOrderEmail(putIntoWork, user);

    return res.send({
      orderId: putIntoWork?._id,
      orderNumber: putIntoWork.orderNumber,
    });
  } catch (err) {
    errorLogger(err, { method: 'putOrderIntoWork', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function updateOrderTitle(req, res) {
  try {
    const { orderId } = req.params;
    const { userId, title } = req.body;

    if (_.isEmpty(userId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const user = await Users
      .findOne({ _id: userId })
      .select({ _id: 1 })
      .lean();

    if (!user) return res.status(404).send({ error: { message: 'USER_NOT_FOUND' } });

    const updatedOrder = await Orders
      .findOneAndUpdate(
        {
          _id: orderId,
          'user.userId': userId,
        },
        { title },
        { new: true },
      );

    if (!updatedOrder) {
      return res
        .status(500)
        .send({ error: { message: 'ERROR_UPDATING_ORDER' } });
    }
    logger.info(`Order's title has been updated: ID ${orderId}. User ID: ${req.user?.userId}`);

    return res.send({
      orderId,
      orderNumber: updatedOrder.orderNumber,
      isUpdated: !!updatedOrder,
    });
  } catch (err) {
    errorLogger(err, { method: 'updateOrderTitle', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getPDFByUserIdAndOrderId(req, res) {
  try {
    const { orderId, userId } = req.params;

    if (_.isEmpty(userId) || _.isEmpty(orderId)) {
      return res.status(400).send({ error: { message: 'BAD_REQUEST' } });
    }

    const order = await Orders.findById({
      _id: orderId,
      'user.userId': userId,
    });

    if (_.isEmpty(order)) return res.status(404).send({ error: { message: 'ORDER_NOT_FOUND' } });

    const printer = new PdfPrinter(PDF_FONTS);
    const docDefinition = generateSpecification(order);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const stream = pdfDoc.pipe(res);

    pdfDoc.end();

    res.statusCode = 200;
    res.setHeader('Content-type', 'application/pdf');

    return stream.on('finish', () => res.end());
  } catch (err) {
    errorLogger(err, { method: 'getPDFByUserIdAndOrderId', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getPDFByOrderIdAndToken(req, res) {
  try {
    const { orderId, token } = req.params;
    if (_.isEmpty(token)) return res.status(400).send({ error: { message: 'INVALID_TOKEN' } });

    const verifiedToken = verifyToken(token);
    if (!verifiedToken) return res.status(400).send({ error: { message: 'INVALID_TOKEN' } });

    const order = await Orders.findById(orderId);
    const printer = new PdfPrinter(PDF_FONTS);
    const docDefinition = generateSpecification(order);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const stream = pdfDoc.pipe(res);

    pdfDoc.end();
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/pdf');

    return stream.on('finish', () => res.end());
  } catch (err) {
    errorLogger(err, { method: 'getPDFByOrderIdAndToken', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getUserAcceptedOrdersList(req, res) {
  try {
    const { userId } = req.params;

    if (_.isEmpty(userId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const orders = await Orders
      .find({
        'user.userId': userId,
        status: { $nin: ['draft', 'new'] },
      })
      .sort({ createdOn: -1 })
      .select({
        number1C: 1,
        orderNumber: 1,
        title: 1,
        systemType: 1,
        totalPrice: 1,
        retailTotalPrice: 1,
        status: 1,
        createdOn: 1,
      })
      .lean();

    return res.send({ orders });
  } catch (err) {
    errorLogger(err, { method: 'getUserAcceptedOrdersList', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getUserSavedOrdersList(req, res) {
  try {
    const { userId } = req.params;

    if (_.isEmpty(userId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const orders = await Orders
      .find({
        'user.userId': userId,
        status: 'new',
      })
      .sort({ createdOn: -1 })
      .select({
        orderNumber: 1,
        title: 1,
        systemType: 1,
        totalPrice: 1,
        retailTotalPrice: 1,
        status: 1,
        packageName: 1,
        createdOn: 1,
      })
      .lean();

    return res.send({ orders });
  } catch (err) {
    errorLogger(err, { method: 'getUserSavedOrdersList', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    if (_.isEmpty(orderId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const order = await Orders
      .findOne({ _id: orderId }, '-updatedOn')
      .lean();

    return res.send({ order });
  } catch (err) {
    errorLogger(err, { method: 'getOrderById', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getOrderModalData(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId;

    if (_.isEmpty(orderId) || _.isEmpty(userId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const user = await Users.findOne({ _id: userId }).select({ packageName: 1 }).lean();
    const order = await Orders.findOne({ _id: orderId }).lean();
    const orderPackageName = order?.packageName || '';
    const userPackageName = user?.packageName || '';

    return res.send({
      orderID: orderId,
      order,
      isPackageChanged: orderPackageName !== userPackageName,
    });
  } catch (err) {
    errorLogger(err, { method: 'getOrderPackageInfo', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function deleteOrderById(req, res) {
  try {
    const { orderId } = req.params;

    if (_.isEmpty(orderId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    await Orders.deleteOne({ _id: orderId });

    return res.send({ orderId });
  } catch (err) {
    errorLogger(err, { method: 'deleteOrderById', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function exchangeOrdersWith1CByRegion(req, res) {
  try {
    const { region } = req.params;
    const regionFormated = regionsValuesList.find((item) => item.value === region)?.label;
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send({ error: { message: 'INVALID_TOKEN' } });

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    const orders = await Orders
      .find({
        'user.region': regionFormated,
        isExchangedWith1C: { $not: { $eq: true } },
        status: 'in-processing',
      })
      .sort({ createdOn: 1 })
      .lean();

    if (!orders.length) return res.send({ status: 200, data: [] });

    const itemsArticleCodes = _.uniq(_.flattenDeep(orders.map((order) => order.items)).map((x) => x.articleCode));

    const dbItems = await PriceList.find({ articleCode: { $in: itemsArticleCodes } }).lean();

    const ordersToSend = OrderService.makeOrdersArrayFor1CExchange(orders, dbItems, region);

    return res.send({ status: 200, data: ordersToSend });
  } catch (err) {
    errorLogger(err, { method: 'exchangeOrdersWith1CByRegion', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


// Test orders exchanging with 1C
async function exchangeOrdersWith1CByRegionTest(req, res) {
  try {
    const { region } = req.params;
    const regionFormated = regionsValuesList.find((item) => item.value === region)?.label;
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send({ error: { message: 'INVALID_TOKEN' } });

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin || NODE_ENV === 'production') return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    const orders = await Orders
      .find({
        'user.region': regionFormated,
        status: 'in-processing',
      })
      .sort({ createdOn: 1 })
      .lean();

    if (!orders.length) return res.send({ status: 200, data: [] });

    const itemsArticleCodes = _.uniq(_.flattenDeep(orders.map((order) => order.items)).map((x) => x.articleCode));

    const dbItems = await PriceList.find({ articleCode: { $in: itemsArticleCodes } }).lean();

    const ordersToSend = OrderService.makeOrdersArrayFor1CExchange(orders, dbItems, region);

    return res.send({ status: 200, data: ordersToSend });
  } catch (err) {
    errorLogger(err, { method: 'exchangeOrdersWith1CByRegionTest', url: NODE_ENV });
    return res.status(500).send(err);
  }
}

async function dumpOrdersFor1CByRegion(req, res) {
  try {
    const { region } = req.params;
    const regionFormated = regionsValuesList.find((item) => item.value === region)?.label;
    let token = req.headers?.authorization;

    if (!token || !token.startsWith('Bearer ')) return res.status(403).send({ error: { message: 'INVALID_TOKEN' } });

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    const orders = await Orders
      .find({ 'user.region': regionFormated, isExchangedWith1C: { $not: { $eq: true } }, status: 'in-processing' })
      .sort({ createdOn: 1 })
      .lean();

    return res.send({ status: 200,
      data: orders.map((order) => ({
        ..._.pick(order, ['_id', 'status', 'isPaid', 'isExchangedWith1C', 'isChangedIn1C', 'packageName',
          'createdOn', 'updatedOn', 'totalPrice', 'retailTotalPrice', 'title', 'systemType', 'orderNumber']),
        comments: {
          customer: order.comments?.customer,
          manager: order.comments?.manager,
        },
        user: {
          userId: order.user?.userId,
          region: order.user?.region,
          phoneNumber: order.user?.phoneNumber,
          fullName: order.user?.fullName,
        },
        description: {
          doorOpeningHeight: order.description?.doorOpeningHeight,
          doorOpeningWidth: order.description?.doorOpeningWidth,
          doorsAmount: order.description?.doorsAmount,
          doorsHeight: order.description?.doorsHeight,
          doorsWidth: order.description?.doorsWidth,
          doorPositioning: order.description?.doorPositioning,
          aluminiumColor: order.description?.aluminiumColor,
        },
        items: (order.items || []).map((item) => ({
          item: item.item,
          amount: item.amount,
          size: item.size,
          height: item.height,
          width: item.width,
          unitPrice: item.unitPrice,
          itemTotalPrice: item.itemTotalPrice,
          labelRu: item.labelRu,
          labelUk: item.labelUk,
          articleCode: item.articleCode,
          texture: item.texture,
          ...(item.position ? {
            position: { doorIndex: item.position.doorIndex, sectionIndex: item.position.sectionIndex },
          } : {}),
          exchange1C: {
            ID: item.exchange1C?.ID,
            FID: item.exchange1C?.FID,
          },
        })),
        delivery: {
          deliveryType: order.delivery?.deliveryType,
          office: order.delivery?.office,
          addressLine: order.delivery?.addressLine,
          city: order.delivery?.city,
          code1C: order.delivery?.code1C,
        },
        doorsSnippet: order.doorsSnippet, // TODO: settle exact fields
      })),
    });
  } catch (err) {
    errorLogger(err, { method: 'exchangeOrdersWith1CByRegion', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function updateOrdersDataFrom1C(req, res) {
  try {
    const orders = req.body && req.body['Заказы'];
    if (_.isEmpty(req.body) || _.isEmpty(orders)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    let token = req.headers?.authorization;
    if (!token || !token.startsWith('Bearer ')) return res.status(403).send({ error: { message: 'INVALID_TOKEN' } });

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    let exchangeData = {};
    if (STORE_ORDERS_STATUSES_EXCHANGE) {
      const dataToStore = {
        name: 'orders-statuses',
        data: req.body,
      };
      exchangeData = await ExchangeStore.create(dataToStore, (err, doc) => {
        if (err) console.error('ExchangeStore, orders-statuses error:', err);
        logger.info(`New ExchangeStore doc ID: ${doc?._id}`);
      });
    }

    const response = await OrderService.parseAndUpdateOrdersFrom1C(orders, exchangeData?._id);

    return res.send(response);
  } catch (err) {
    errorLogger(err, { method: 'updateOrdersDataFrom1C', url: NODE_ENV });
    return res.status(500).send(err);
  }
}

async function setOrdersExchanged(req, res) {
  try {
    const orders = req.body && req.body['Заказы'];
    if (_.isEmpty(req.body) || _.isEmpty(orders)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    let token = req.headers?.authorization;
    if (!token || !token.startsWith('Bearer ')) return res.status(403).send({ error: { message: 'INVALID_TOKEN' } });

    token = token.substring(7);
    const admin = await Users.findOne({ adminAccessToken: token, role: 'admin' }).exec();

    if (!admin) return res.status(403).send({ error: { message: 'PERMISSION_DENIED' } });

    const orderIds = orders.map((order) => order['СсылкаЗаказа']);
    await Orders.updateMany(
      { _id: { $in: orderIds }, isExchangedWith1C: { $not: { $eq: true } } },
      { isExchangedWith1C: true, updatedOn: new Date(), exchangedOn: new Date() },
    );

    const exchangeOutcome = {
      rejectedRecords: { IDs: [], count: 0 },
      successfulRecords: { IDs: orderIds, count: orderIds.length },
    };

    return res.send(exchangeOutcome);
  } catch (err) {
    errorLogger(err, { method: 'setOrdersExchanged', url: NODE_ENV });
    return res.status(500).send(err);
  }
}

module.exports = router;
