import _ from 'lodash';
import express from 'express';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import PdfPrinter from 'pdfmake/src/printer';
import dotenv from 'dotenv-safe';

import { generateSpecification } from '../helpers/pdf';
import { PDF_FONTS } from '../helpers/constants';

import errorLogger from '../helpers/errorLogger';
import logger from '../helpers/logger';

import {
  OrdersDraft,
  Users,
} from '../db';

dotenv.config({ path: '.env' });
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const router = express.Router();

const { NODE_ENV = 'development' } = process.env;

router.post('/', createOrderDraft);

router.put('/:orderId/update', updateOrderDraft);

router.delete('/:orderId/delete', deleteOrderDraftById);

router.get('/:userId/:orderId/pdf', getPDFByUserIdAndOrderDraftId);
router.get('/:orderId', getOrderDraftById);


async function createOrderDraft(req, res) {
  try {
    const {
      userId,
      data,
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
      })
      .lean();

    if (!user) {
      return res.status(400).send({ error: { message: 'USER_NOT_FOUND' } });
    }

    const userFullName = `${user.firstName} ${user.lastName}`;
    const orderToCreate = {
      ...data,
      ...{
        systemType,
        doorsSnippet,
        status: 'draft',
        user: {
          userId,
          region: user.primaryRegion,
          phoneNumber: user.phone,
          fullName: userFullName,
        },
      },
    };

    const order = new OrdersDraft(orderToCreate);
    await order.save();
    logger.info(`OrderDraft has been created: ID: ${order._id}. User ID: ${req.user?.userId}`);

    return res.send({ orderId: order._id });
  } catch (err) {
    errorLogger(err, { method: 'createOrderDraft', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function updateOrderDraft(req, res) {
  try {
    const { orderId } = req.params;
    const { userId, data } = req.body;

    if (_.isEmpty(userId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

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

    if (!user) return res.status(400).send({ error: { message: 'USER_NOT_FOUND' } });

    const updatedDoc = await OrdersDraft
      .findOneAndUpdate(
        {
          _id: orderId,
          'user.userId': userId,
        },
        {
          ...data,
          ...{
            user: {
              userId,
              region: user.primaryRegion,
              phoneNumber: user.phone,
              fullName: `${user.firstName} ${user.lastName}`,
            },
          },
        },
        { new: true },
      );

    if (!updatedDoc) {
      return res
        .status(500)
        .send({ error: { message: 'ERROR_UPDATING_ORDER' } });
    }
    logger.info(`OrderDraft has been updated: ID ${orderId}. User ID: ${req.user?.userId}`);

    return res.send({
      orderId,
      isUpdated: !!updatedDoc,
    });
  } catch (err) {
    errorLogger(err, { method: 'updateOrderDraft', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getPDFByUserIdAndOrderDraftId(req, res) {
  try {
    const { orderId, userId } = req.params;

    if (_.isEmpty(userId) || _.isEmpty(orderId)) {
      return res.status(400).send({ error: { message: 'BAD_REQUEST' } });
    }

    const order = await OrdersDraft.findById({
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
    errorLogger(err, { method: 'getPDFByUserIdAndOrderDraftId', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function getOrderDraftById(req, res) {
  try {
    const { orderId } = req.params;

    if (_.isEmpty(orderId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    const order = await OrdersDraft
      .findOne({ _id: orderId }, '-updatedOn')
      .lean();

    return res.send({ order });
  } catch (err) {
    errorLogger(err, { method: 'getOrderDraftById', url: NODE_ENV });
    return res.status(500).send(err);
  }
}


async function deleteOrderDraftById(req, res) {
  try {
    const { orderId } = req.params;

    if (_.isEmpty(orderId)) return res.status(400).send({ error: { message: 'BAD_REQUEST' } });

    await OrdersDraft.deleteOne({ _id: orderId });

    return res.send({ orderId });
  } catch (err) {
    errorLogger(err, { method: 'deleteOrderDraftById', url: NODE_ENV });
    return res.status(500).send(err);
  }
}

module.exports = router;
