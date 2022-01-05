import { createActions } from 'reduxsauce';

import API from '../../api';
import { AuthService } from '../../services';


const { Types, Creators } = createActions({
  getMySavedOrdersSuccess: ['orders'],
  getMySavedOrdersFailure: ['errorMessage'],
  getMySavedOrdersRequest: () => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();
      const response = await API.orders.list.savedByUserId(userId);
      const { ok, problem, data } = response || {};
      const error = data?.error || {};
      const orders = response?.data?.orders || [];
      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage) {
        dispatch(Creators.getMySavedOrdersFailure(errorMessage));
        return;
      }

      dispatch(Creators.getMySavedOrdersSuccess(orders));
    } catch (error) {
      dispatch(Creators.getMySavedOrdersFailure(error.message || error.reason));
    }
  },

  togglePutOrderIntoWorkModal: ['isOpen'],

  toggleDeleteOrderModal: ['isOpen'],

  toggleCopyOrderModal: ['isOpen'],
});

export const MySavedOrdersTypes = Types;
export default Creators;
