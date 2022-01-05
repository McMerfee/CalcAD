import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { DeliveryTypes } from '../actions/delivery';

const INITIAL_STATE = {
  isLoading: false,
  errorMessage: null,
  deliveryOptions: [],
};

/**
 * Reducers handlers
 */

const getDeliveryRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
});

const getDeliverySuccess = (state = INITIAL_STATE, { deliveryOptions }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: '' },
  deliveryOptions: { $set: deliveryOptions || [] },
});

const getDeliveryFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


/**
 * Reducers
 */

export default createReducer(INITIAL_STATE, {
  [DeliveryTypes.GET_DELIVERY_REQUEST]: getDeliveryRequest,
  [DeliveryTypes.GET_DELIVERY_SUCCESS]: getDeliverySuccess,
  [DeliveryTypes.GET_DELIVERY_FAILURE]: getDeliveryFailure,
});
