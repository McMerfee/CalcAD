import { createActions } from 'reduxsauce';

import API from '../../api';
import { AuthService } from '../../services';

import { defaultRegion } from '../../helpers/constants';


const { Types, Creators } = createActions({
  getPriceListSuccess: ['priceList'],
  getPriceListFailure: ['errorMessage'],
  getPriceListRequest: () => async (dispatch, state) => {
    try {
      const userId = AuthService.getUserId() || null;
      const currentState = state();
      const primaryRegion = currentState.profile?.primaryRegion || defaultRegion;
      const response = await API.priceList.get(userId, primaryRegion);
      const { ok, problem, data } = response || {};
      const error = data?.error || {};
      const priceList = response?.data?.priceList || [];
      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage) {
        dispatch(Creators.getPriceListFailure(errorMessage));
        return;
      }

      dispatch(Creators.getPriceListSuccess(priceList));
    } catch (error) {
      dispatch(Creators.getPriceListFailure(error.message || error.reason));
    }
  },
});

export const PriceListTypes = Types;
export default Creators;
