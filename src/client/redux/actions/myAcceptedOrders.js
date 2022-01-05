import { createActions } from 'reduxsauce';

import API from '../../api';
import { AuthService } from '../../services';


const { Types, Creators } = createActions({
  getMyAcceptedOrdersSuccess: ['orders'],
  getMyAcceptedOrdersFailure: ['errorMessage'],
  getMyAcceptedOrdersRequest: () => async (dispatch) => {
    try {
      const userId = AuthService.getUserId();
      const response = await API.orders.list.acceptedByUserId(userId);
      const { ok, problem, data } = response || {};
      const error = data?.error || {};
      const orders = response?.data?.orders || [];
      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage) {
        dispatch(Creators.getMyAcceptedOrdersFailure(errorMessage));
        return;
      }

      dispatch(Creators.getMyAcceptedOrdersSuccess(orders));
    } catch (error) {
      dispatch(Creators.getMyAcceptedOrdersFailure(error.message || error.reason));
    }
  },
});

export const MyAcceptedOrdersTypes = Types;
export default Creators;
