import express from 'express';

import authMiddleware from '../middlewares/auth';

import configController from '../controllers/configController';
import deliveryController from '../controllers/deliveryController';
import jsonController from '../controllers/jsonController';
import orderController from '../controllers/orderController';
import orderDraftController from '../controllers/orderDraftController';
import priceListController from '../controllers/priceListController';
import systemConstantsController from '../controllers/systemConstantsController';
import tfaController from '../controllers/tfaController';
import userController from '../controllers/userController';


const router = express.Router();

router.use(authMiddleware);

router.use('/config', configController);
router.use('/delivery', deliveryController);
router.use('/json', jsonController);
router.use('/orders', orderController);
router.use('/orders-draft', orderDraftController);
router.use('/price-list', priceListController);
router.use('/system-constants', systemConstantsController);
router.use('/tfa', tfaController);
router.use('/users', userController);

export default router;
