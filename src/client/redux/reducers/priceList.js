import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { PriceListTypes } from '../actions/priceList';

const INITIAL_STATE = {
  isLoading: false,
  errorMessage: null,
  priceList: [],
};

/**
 * Reducers handlers
 */

const getPriceListRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
});

const getPriceListSuccess = (state = INITIAL_STATE, { priceList }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: '' },
  priceList: { $set: priceList || [] },
});

const getPriceListFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


/**
 * Reducers
 */

export default createReducer(INITIAL_STATE, {
  [PriceListTypes.GET_PRICE_LIST_REQUEST]: getPriceListRequest,
  [PriceListTypes.GET_PRICE_LIST_SUCCESS]: getPriceListSuccess,
  [PriceListTypes.GET_PRICE_LIST_FAILURE]: getPriceListFailure,
});
