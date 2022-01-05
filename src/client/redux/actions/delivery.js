import { createActions } from 'reduxsauce';

import API from '../../api';


const { Types, Creators } = createActions({
  getDeliverySuccess: ['deliveryOptions'],
  getDeliveryFailure: ['errorMessage'],
  getDeliveryRequest: () => async (dispatch) => {
    try {
      const response = await API.delivery.get();
      const { ok, problem, data } = response || {};
      const error = data?.error || {};
      const deliveryOptions = response?.data?.deliveryOptions || [];
      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage) {
        dispatch(Creators.getDeliveryFailure(errorMessage));
        return;
      }

      dispatch(Creators.getDeliverySuccess(deliveryOptions));
    } catch (error) {
      dispatch(Creators.getDeliveryFailure(error.message || error.reason));
    }
  },
});

export const DeliveryTypes = Types;

export default Creators;
