import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { OrderTypes } from '../actions/order';

const INITIAL_STATE = {
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  specification: {},
  region: '',
  title: '',
  currentOrderId: '',
  currentOrderNumber: '',
  shouldShowOrderPage: false,
  isOrderAccepted: false, // TODO: rename
  isOrderTitleModalOpen: false,
  isFetched: false,
  delivery: {
    code1C: '',
    type: '',
    postOffice: '',
    addressLine: '',
    city: '',
    region: '',
  },
  currentOrderModalData: {
    orderID: '',
    orderOrigin: {},
    orderRecalculated: {},
    isPackageChanged: false,
    isTotalPriceChanged: false,
  },
};

/**
 * Reducers handlers
 */

const calculateOrderRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const calculateOrderSuccess = (state = INITIAL_STATE, { specification }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: '' },
  specification: { $set: specification || [] },
});

const calculateOrderFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const putOrderIntoWorkRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const putOrderIntoWorkSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  successMessage: { $set: 'Замовлення віддано в роботу' },
  errorMessage: { $set: '' },
  currentOrderModalData: {
    orderID: { $set: '' },
    orderOrigin: { $set: {} },
    orderRecalculated: { $set: {} },
    isPackageChanged: { $set: false },
    isTotalPriceChanged: { $set: false },
  },
});

const putOrderIntoWorkFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const deleteOrderRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const deleteOrderSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  successMessage: { $set: 'Замовлення видалено' },
});

const deleteOrderFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const copyOrderRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const copyOrderSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  successMessage: { $set: 'Замовлення зкопійовано' },
});

const copyOrderFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const updateOrderTitleRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const updateOrderTitleSuccess = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  successMessage: { $set: 'Замовлення оновлено' },
});

const updateOrderTitleFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const saveOrderRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const saveOrderSuccess = (state = INITIAL_STATE, { orderId, orderNumber }) => update(state, {
  isLoading: { $set: false },
  currentOrderId: { $set: orderId || state.currentOrderId },
  currentOrderNumber: { $set: orderNumber || state.currentOrderNumber },
  successMessage: { $set: 'Замовлення збереженно' },
});

const saveOrderFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const toggleShouldShowOrderPage = (state = INITIAL_STATE, { shouldOpen }) => update(state, {
  shouldShowOrderPage: { $set: shouldOpen },
});


const resetCurrentOrderData = (state = INITIAL_STATE) => update(state, {
  currentOrderId: { $set: '' },
  currentOrderNumber: { $set: '' },
  isOrderAccepted: { $set: false },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
  specification: { $set: INITIAL_STATE.specification },
  region: { $set: INITIAL_STATE.region },
  title: { $set: INITIAL_STATE.title },
});


const fetchOrderDataRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  isFetched: { $set: false },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});

const fetchOrderDataSuccess = (state = INITIAL_STATE, { orderId, orderNumber, title }) => update(state, {
  isLoading: { $set: false },
  isFetched: { $set: true },
  currentOrderId: { $set: orderId || state.currentOrderId },
  currentOrderNumber: { $set: orderNumber || state.currentOrderNumber },
  title: { $set: title || state.title },
});

const fetchOrderDataFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  isFetched: { $set: true },
  errorMessage: { $set: errorMessage },
});



const fetchOrderModalDataRequest = (state = INITIAL_STATE, { orderID }) => update(state, {
  currentOrderModalData: { orderID: { $set: orderID } },
});

const fetchOrderModalDataSuccess = (state = INITIAL_STATE, {
  orderID,
  orderOrigin,
  orderRecalculated,
  isPackageChanged,
  isTotalPriceChanged,
}) => update(state, {
  currentOrderModalData: {
    orderID: { $set: orderID },
    orderOrigin: { $set: orderOrigin },
    orderRecalculated: { $set: orderRecalculated },
    isPackageChanged: { $set: isPackageChanged },
    isTotalPriceChanged: { $set: isTotalPriceChanged },
  },
});

const fetchOrderModalDataFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  errorMessage: { $set: errorMessage },
});


const setSpecificationBySnippet = (state = INITIAL_STATE, { specification }) => update(state, {
  specification: {
    description: { $set: specification?.description || state.description },
    items: { $set: specification?.items || state.items },
    totalPrice: { $set: specification?.totalPrice || state.totalPrice },
    retailTotalPrice: { $set: specification?.retailTotalPrice || state.retailTotalPrice },
    user: { $set: specification?.user || state.user },
  },
  isOrderAccepted: { $set: specification.status === 'in-processing' },
  successMessage: { $set: '' },
});


const resetSpecification = (state = INITIAL_STATE) => update(state, {
  specification: { $set: INITIAL_STATE.specification },
  region: { $set: INITIAL_STATE.region },
  currentOrderId: { $set: INITIAL_STATE.currentOrderId },
  currentOrderNumber: { $set: INITIAL_STATE.currentOrderNumber },
  isOrderAccepted: { $set: INITIAL_STATE.isOrderAccepted },
  errorMessage: { $set: '' },
  successMessage: { $set: '' },
});


const toggleOrderTitleModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isOrderTitleModalOpen: { $set: isOpen },
});


const updateOrderTitle = (state = INITIAL_STATE, { title }) => update(state, {
  title: { $set: title },
});


const showErrorMessage = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  errorMessage: { $set: errorMessage },
});


/**
 * Reducers
 */

export default createReducer(INITIAL_STATE, {
  [OrderTypes.CALCULATE_ORDER_REQUEST]: calculateOrderRequest,
  [OrderTypes.CALCULATE_ORDER_SUCCESS]: calculateOrderSuccess,
  [OrderTypes.CALCULATE_ORDER_FAILURE]: calculateOrderFailure,

  [OrderTypes.PUT_ORDER_INTO_WORK_REQUEST]: putOrderIntoWorkRequest,
  [OrderTypes.PUT_ORDER_INTO_WORK_SUCCESS]: putOrderIntoWorkSuccess,
  [OrderTypes.PUT_ORDER_INTO_WORK_FAILURE]: putOrderIntoWorkFailure,

  [OrderTypes.SAVE_ORDER_REQUEST]: saveOrderRequest,
  [OrderTypes.SAVE_ORDER_SUCCESS]: saveOrderSuccess,
  [OrderTypes.SAVE_ORDER_FAILURE]: saveOrderFailure,

  [OrderTypes.DELETE_ORDER_REQUEST]: deleteOrderRequest,
  [OrderTypes.DELETE_ORDER_SUCCESS]: deleteOrderSuccess,
  [OrderTypes.DELETE_ORDER_FAILURE]: deleteOrderFailure,

  [OrderTypes.COPY_ORDER_REQUEST]: copyOrderRequest,
  [OrderTypes.COPY_ORDER_SUCCESS]: copyOrderSuccess,
  [OrderTypes.COPY_ORDER_FAILURE]: copyOrderFailure,

  [OrderTypes.UPDATE_ORDER_TITLE_REQUEST]: updateOrderTitleRequest,
  [OrderTypes.UPDATE_ORDER_TITLE_SUCCESS]: updateOrderTitleSuccess,
  [OrderTypes.UPDATE_ORDER_TITLE_FAILURE]: updateOrderTitleFailure,

  [OrderTypes.TOGGLE_SHOULD_SHOW_ORDER_PAGE]: toggleShouldShowOrderPage,

  [OrderTypes.RESET_CURRENT_ORDER_DATA]: resetCurrentOrderData,

  [OrderTypes.FETCH_ORDER_DATA_REQUEST]: fetchOrderDataRequest,
  [OrderTypes.FETCH_ORDER_DATA_SUCCESS]: fetchOrderDataSuccess,
  [OrderTypes.FETCH_ORDER_DATA_FAILURE]: fetchOrderDataFailure,

  [OrderTypes.FETCH_ORDER_MODAL_DATA_REQUEST]: fetchOrderModalDataRequest,
  [OrderTypes.FETCH_ORDER_MODAL_DATA_SUCCESS]: fetchOrderModalDataSuccess,
  [OrderTypes.FETCH_ORDER_MODAL_DATA_FAILURE]: fetchOrderModalDataFailure,

  [OrderTypes.SET_SPECIFICATION_BY_SNIPPET]: setSpecificationBySnippet,

  [OrderTypes.RESET_SPECIFICATION]: resetSpecification,

  [OrderTypes.TOGGLE_ORDER_TITLE_MODAL]: toggleOrderTitleModal,

  [OrderTypes.UPDATE_ORDER_TITLE]: updateOrderTitle,

  [OrderTypes.SHOW_ERROR_MESSAGE]: showErrorMessage,
});
