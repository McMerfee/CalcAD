import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { MyAcceptedOrdersTypes } from '../actions/myAcceptedOrders';

const INITIAL_STATE = {
  orders: [],
  isLoading: false,
  errorMessage: '',
};

const getMyAcceptedOrdersRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
});

const getMyAcceptedOrdersSuccess = (state = INITIAL_STATE, { orders }) => update(state, {
  isLoading: { $set: false },
  orders: { $set: orders?.length ? orders : [] },
});

const getMyAcceptedOrdersFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

export default createReducer(INITIAL_STATE, {
  [MyAcceptedOrdersTypes.GET_MY_ACCEPTED_ORDERS_REQUEST]: getMyAcceptedOrdersRequest,
  [MyAcceptedOrdersTypes.GET_MY_ACCEPTED_ORDERS_SUCCESS]: getMyAcceptedOrdersSuccess,
  [MyAcceptedOrdersTypes.GET_MY_ACCEPTED_ORDERS_FAILURE]: getMyAcceptedOrdersFailure,
});
