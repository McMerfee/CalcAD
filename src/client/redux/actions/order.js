import _ from 'lodash';
import { createActions } from 'reduxsauce';

import API from '../../api';

import { AuthService } from '../../services';

import { calculateOrder } from '../../helpers/priceHelper';
import { defaultPackageName } from '../../helpers/constants';
import { defaultPackagesByRegion } from '../../../server/helpers/constants';

import ConfigActions from './config';
import DoorsActions from './doorsAndSections';
import SystemsActions from './systems';
import MySavedOrdersActions from './mySavedOrders';


const { Types, Creators } = createActions({
  calculateOrderSuccess: ['specification'],
  calculateOrderFailure: ['errorMessage'],
  calculateOrderRequest: () => async (dispatch, state) => {
    try {
      const currentState = state();
      const hasRegionDefaultPackage = defaultPackagesByRegion
        .find((p) => p.packageName === currentState.profile?.packageName);
      const packageName = hasRegionDefaultPackage?.packageName ? defaultPackageName : currentState.profile?.packageName;
      const currentSystem = currentState.systems?.currentSystem;
      const isSystemConctantsMatched = currentState?.config?.systemConctants?.length
        && currentState?.config?.systemConctants[0]?.systemType === currentSystem;

      if (!isSystemConctantsMatched
        || !currentState?.doorsAndSections?.main?.sideProfile?.value
        || !currentState?.priceList?.priceList?.length) return;

      const orderPriceAndSpecification = calculateOrder(currentState, packageName);
      const { specification } = orderPriceAndSpecification;

      dispatch(Creators.calculateOrderSuccess(specification));
    } catch (error) {
      console.log(error.message || error.reason);
    }
  },


  putOrderIntoWorkSuccess: ['orderId', 'orderNumber'],
  putOrderIntoWorkFailure: ['errorMessage'],
  putOrderIntoWorkRequest: (id, data, recalculatedOrder) => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();

      if (!userId) {
        dispatch(Creators.putOrderIntoWorkFailure('USER_NOT_FOUND'));
        return;
      }

      let dataToUpdate = {
        status: 'in-processing',
        delivery: data,
      };

      if (!_.isEmpty(recalculatedOrder)) {
        dataToUpdate = {
          ...dataToUpdate,
          ...{
            items: recalculatedOrder.items,
            retailTotalPrice: recalculatedOrder.retailTotalPrice,
            totalPrice: recalculatedOrder.totalPrice,
          },
        };
      }

      const response = await API.orders.putIntoWork(id, userId, dataToUpdate);
      const errorMsg = !response.ok ? (response.data?.message || response.problem) : '';

      const { orderId, orderNumber } = response;

      if (errorMsg) {
        dispatch(Creators.putOrderIntoWorkFailure(errorMsg));
        return;
      }

      if (!orderId) {
        dispatch(Creators.putOrderIntoWorkFailure('PUT_INTO_WORK_FAILURE'));
        return;
      }

      dispatch(Creators.putOrderIntoWorkSuccess(orderId, orderNumber));
      window.location.reload();
    } catch (error) {
      dispatch(Creators.putOrderIntoWorkFailure(error.message || error.reason));
    }
  },


  updateOrderTitleSuccess: ['orderId', 'orderNumber'],
  updateOrderTitleFailure: ['errorMessage'],
  updateOrderTitleRequest: (id, title) => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();

      if (!userId) {
        dispatch(Creators.updateOrderTitleFailure('USER_NOT_FOUND'));
        return;
      }

      const response = await API.orders.updateTitle(id, userId, title);

      const errorMsg = !response.ok
        ? (response.data?.message || response.problem)
        : '';

      const { orderId, orderNumber } = response;

      if (errorMsg) {
        dispatch(Creators.updateOrderTitleFailure(errorMsg));
        return;
      }

      if (!orderId) {
        dispatch(Creators.updateOrderTitleFailure('ERROR_UPDATING_ORDER'));
        return;
      }

      dispatch(Creators.updateOrderTitleSuccess(orderId, orderNumber));
      window.location.reload();
    } catch (error) {
      dispatch(Creators.updateOrderTitleFailure(error.message || error.reason));
    }
  },


  saveOrderSuccess: ['orderId', 'orderNumber'],
  saveOrderFailure: ['errorMessage'],
  saveOrderRequest: () => async (dispatch, state) => {
    try {
      const currentState = state();
      const userId = AuthService.getUserId();
      const { currentSystem } = currentState.systems;
      const {
        currentOrderId,
        specification,
        region,
        title,
      } = currentState.order;
      const pathArray = window.location.pathname.split('/');
      const orderIdInPath = pathArray[2] !== 'edit' ? pathArray[2] : '';
      const orderIdToUpdate = currentOrderId || orderIdInPath;

      const doorsSnippet = _.pick(
        currentState.doorsAndSections,
        ['minDoorsAmount', 'maxDoorsAmount', 'minSectionsAmount', 'maxSectionsAmount', 'main', 'doors'],
      );

      if (!userId) {
        dispatch(Creators.saveOrderFailure('USER_NOT_FOUND'));
        return;
      }

      if (_.isEmpty(specification)) {
        dispatch(Creators.saveOrderFailure('Specification is empty'));
        return;
      }

      const dataToUpdate = {
        ...specification,
        ...{
          status: 'new',
          doorsSnippet,
          title,
        },
      };

      const orderToCreate = {
        ...specification,
        ...{
          status: 'new',
          title,
        },
      };

      const response = orderIdToUpdate
        ? await API.orders.update(orderIdToUpdate, userId, dataToUpdate, region)
        : await API.orders.create(userId, orderToCreate, region, doorsSnippet, currentSystem);

      const errorMsg = !response.ok
        ? (response.data?.message || response.problem)
        : '';

      const { orderId, orderNumber } = response;

      if (errorMsg) {
        dispatch(Creators.saveOrderFailure(errorMsg));
        return;
      }

      if (!orderId) {
        dispatch(Creators.saveOrderFailure('ERROR_UPDATING_ORDER'));
        return;
      }

      dispatch(Creators.saveOrderSuccess(orderId, orderNumber));
      dispatch(MySavedOrdersActions.getMySavedOrdersRequest());
    } catch (error) {
      dispatch(Creators.saveOrderFailure(error.message || error.reason));
    }
  },


  deleteOrderSuccess: ['orderId', 'orderNumber'],
  deleteOrderFailure: ['errorMessage'],
  deleteOrderRequest: (id) => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();

      if (!userId) {
        dispatch(Creators.deleteOrderFailure('USER_NOT_FOUND'));
        return;
      }

      const response = await API.orders.delete(id);

      const errorMsg = !response.ok
        ? (response.data?.message || response.problem)
        : '';

      const { orderId, orderNumber } = response;

      if (errorMsg) {
        dispatch(Creators.deleteOrderFailure(errorMsg));
        return;
      }

      if (!orderId) {
        dispatch(Creators.deleteOrderFailure('ERROR_REMOVING_ORDER'));
        return;
      }

      dispatch(Creators.deleteOrderSuccess(orderId, orderNumber));
      window.location.reload();
    } catch (error) {
      dispatch(Creators.deleteOrderFailure(error.message || error.reason));
    }
  },


  copyOrderSuccess: ['orderId', 'orderNumber'],
  copyOrderFailure: ['errorMessage'],
  copyOrderRequest: (id, title) => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();

      if (!userId) {
        dispatch(Creators.copyOrderFailure('USER_NOT_FOUND'));
        return;
      }

      const response = await API.orders.copy(userId, id, title);

      const errorMsg = !response.ok
        ? (response.data?.message || response.problem)
        : '';

      const { orderId, orderNumber } = response;

      if (errorMsg) {
        dispatch(Creators.copyOrderFailure(errorMsg));
        return;
      }

      if (!orderId) {
        dispatch(Creators.copyOrderFailure('COPY_ORDER_FAILURE'));
        return;
      }

      dispatch(Creators.copyOrderSuccess(orderId, orderNumber));
      window.location.reload();
    } catch (error) {
      dispatch(Creators.copyOrderFailure(error.message || error.reason));
    }
  },


  toggleShouldShowOrderPage: ['shouldOpen'],

  resetCurrentOrderData: [null],

  showErrorMessage: ['errorMessage'],


  fetchOrderDataSuccess: ['orderId', 'orderNumber', 'title'],
  fetchOrderDataFailure: ['errorMessage'],
  fetchOrderDataRequest: (orderID) => async (dispatch, state) => {
    try {
      const currentState = state();
      const { doorsAndSections, order } = currentState;
      const pathArray = window.location.pathname.split('/');
      const orderId = orderID || pathArray[2];
      const isEditPage = pathArray[3] === 'edit';
      const userId = AuthService.getUserId();

      if (!userId || !orderId) return;

      const response = await API.orders.get(orderId);
      const {
        ok,
        problem,
        data: {
          order: orderDB,
          message,
        },
      } = response || {};

      const {
        orderNumber = '',
        title = '',
        user,
        status,
        systemType,
      } = orderDB;

      let {
        doorsSnippet,
        description,
        items,
        totalPrice,
        retailTotalPrice,
      } = orderDB;

      const errorMsg = !ok ? (message || problem) : '';
      if (errorMsg) {
        dispatch(Creators.fetchOrderDataFailure(errorMsg));
        return;
      }

      if (isEditPage && !_.isEmpty(order.currentOrderId)) {
        const {
          specification,
        } = order;
        description = specification.description;
        items = specification.items;
        totalPrice = specification.totalPrice;
        retailTotalPrice = specification.retailTotalPrice;

        doorsSnippet = _.pick(
          doorsAndSections,
          ['minDoorsAmount', 'maxDoorsAmount', 'minSectionsAmount', 'maxSectionsAmount', 'main', 'doors'],
        );
      }

      dispatch(SystemsActions.setCurrentSystem(systemType));
      dispatch(Creators.fetchOrderDataSuccess(orderId, orderNumber, title));
      dispatch(DoorsActions.setOrderBySnippet(doorsSnippet));
      dispatch(Creators.setSpecificationBySnippet({
        description,
        items,
        totalPrice,
        user,
        status,
        retailTotalPrice,
      }));
      dispatch(ConfigActions.getConfigRequest(systemType));
    } catch (error) {
      dispatch(Creators.fetchOrderDataFailure(error.message || error.reason));
    }
  },


  fetchOrderModalDataSuccess: [
    'orderID', 'orderOrigin', 'orderRecalculated', 'isPackageChanged', 'isTotalPriceChanged',
  ],
  fetchOrderModalDataFailure: ['errorMessage'],
  fetchOrderModalDataRequest: (orderID) => async (dispatch, state) => {
    try {
      const currentState = state();
      const userId = AuthService.getUserId();
      if (!userId || !orderID) return;

      const response = await API.orders.getOrderModalData(orderID);
      const {
        ok,
        problem,
        data: { isPackageChanged, message },
      } = response || {};
      const orderOrigin = response?.data?.order || {};

      const errorMsg = !ok ? (message || problem) : '';
      if (errorMsg) {
        dispatch(Creators.fetchOrderModalDataFailure(errorMsg));
        return;
      }

      const configResponse = await API.config.get(orderOrigin?.systemType);
      const error = configResponse?.data?.error || {};
      const config = configResponse?.data?.config || [];
      const errorMessage = !configResponse?.ok
        ? (error?.message || configResponse?.data?.message || problem)
        : '';
      if (errorMessage) {
        dispatch(Creators.fetchOrderModalDataFailure(errorMsg));
        return;
      }

      const hasRegionDefaultPackage = defaultPackagesByRegion
        .find((p) => p.packageName === currentState.profile?.packageName);
      const packageName = hasRegionDefaultPackage?.packageName ? defaultPackageName : currentState.profile?.packageName;

      const stateData = {
        ...currentState,
        ...{
          config,
          systems: {
            ...currentState.systems,
            ...{ currentSystem: orderOrigin?.systemType },
          },
          priceList: {
            ...currentState.priceList,
            ...{ specification: {
              user: orderOrigin?.user,
              description: orderOrigin?.description,
              items: orderOrigin?.items,
              totalPrice: orderOrigin?.totalPrice,
              retailTotalPrice: orderOrigin?.retailTotalPrice,
            } },
          },
          doorsAndSections: orderOrigin?.doorsSnippet,
        },
      };

      // Recalculate Order before put it into work
      const orderPriceAndSpecification = calculateOrder(stateData, packageName);
      const orderRecalc = orderPriceAndSpecification?.specification;
      const isTotalPriceChanged = orderRecalc?.totalPrice !== orderOrigin?.totalPrice;

      dispatch(Creators
        .fetchOrderModalDataSuccess(orderID, orderOrigin, orderRecalc, isPackageChanged, isTotalPriceChanged));
    } catch (error) {
      dispatch(Creators.fetchOrderModalDataFailure(error.message || error.reason));
    }
  },


  setSpecificationBySnippet: ['specification'],

  resetSpecification: null,

  toggleOrderTitleModal: ['isOpen'],

  updateOrderTitle: ['title'],
});

export const OrderTypes = Types;
export default Creators;
