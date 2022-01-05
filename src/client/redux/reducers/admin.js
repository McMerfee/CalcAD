import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { AdminTypes } from '../actions/admin';

const INITIAL_STATE = {
  isLoading: false,
  errorMessage: null,
  ordersCountTotal: 0,
  ordersCountNew: 0,
  ordersCountInProcessing: 0,
  usersCountWithNewOrders: 0,
  usersCountWithInProcessingOrders: 0,
};

/** Get Info for Admin page */

const getAdminInfoRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  isConfigFetched: { $set: false },
});

const getAdminInfoSuccess = (state = INITIAL_STATE, { data }) => update(state, {
  isLoading: { $set: false },
  ordersCountTotal: { $set: data?.ordersCountTotal || 0 },
  ordersCountNew: { $set: data?.ordersCountNew || 0 },
  ordersCountInProcessing: { $set: data?.ordersCountInProcessing || 0 },
  usersCountWithNewOrders: { $set: data?.usersCountWithNewOrders || 0 },
  usersCountWithInProcessingOrders: { $set: data?.usersCountWithInProcessingOrders || 0 },
});

const getAdminInfoFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/**
 * Reducers
 */

export default createReducer(INITIAL_STATE, {

  [AdminTypes.GET_ADMIN_INFO_REQUEST]: getAdminInfoRequest,
  [AdminTypes.GET_ADMIN_INFO_SUCCESS]: getAdminInfoSuccess,
  [AdminTypes.GET_ADMIN_INFO_FAILURE]: getAdminInfoFailure,
});
