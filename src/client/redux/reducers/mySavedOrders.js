import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { MySavedOrdersTypes } from '../actions/mySavedOrders';

const INITIAL_STATE = {
  orders: [],
  isLoading: false,
  isComplete: false,
  errorMessage: '',
  isPutOrderIntoWorkModalOpen: false,
  isDeleteOrderModalOpen: false,
  isCopyOrderModalOpen: false,
};

const getMySavedOrdersRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  isComplete: { $set: false },
  errorMessage: { $set: '' },
});

const getMySavedOrdersSuccess = (state = INITIAL_STATE, { orders }) => update(state, {
  isLoading: { $set: false },
  isComplete: { $set: true },
  orders: { $set: orders?.length ? orders : [] },
});

const getMySavedOrdersFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  isComplete: { $set: true },
  errorMessage: { $set: errorMessage },
});

const togglePutOrderIntoWorkModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isPutOrderIntoWorkModalOpen: { $set: isOpen },
});

const toggleDeleteOrderModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isDeleteOrderModalOpen: { $set: isOpen },
});

const toggleCopyOrderModal = (state = INITIAL_STATE, { isOpen }) => update(state, {
  isCopyOrderModalOpen: { $set: isOpen },
});

export default createReducer(INITIAL_STATE, {
  [MySavedOrdersTypes.GET_MY_SAVED_ORDERS_REQUEST]: getMySavedOrdersRequest,
  [MySavedOrdersTypes.GET_MY_SAVED_ORDERS_SUCCESS]: getMySavedOrdersSuccess,
  [MySavedOrdersTypes.GET_MY_SAVED_ORDERS_FAILURE]: getMySavedOrdersFailure,

  [MySavedOrdersTypes.TOGGLE_PUT_ORDER_INTO_WORK_MODAL]: togglePutOrderIntoWorkModal,
  [MySavedOrdersTypes.TOGGLE_DELETE_ORDER_MODAL]: toggleDeleteOrderModal,
  [MySavedOrdersTypes.TOGGLE_COPY_ORDER_MODAL]: toggleCopyOrderModal,
});
