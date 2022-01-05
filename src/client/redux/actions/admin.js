import { createActions } from 'reduxsauce';

import API from '../../api';

const { Types, Creators } = createActions({
  getAdminInfoSuccess: ['data'],
  getAdminInfoFailure: ['errorMessage'],
  getAdminInfoRequest: () => async (dispatch) => {
    try {
      const response = await API.admin.get();
      const { ok, problem, data } = response || {};
      const error = data?.error || {};

      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage) {
        dispatch(Creators.getAdminInfoFailure(errorMessage));
        return;
      }

      dispatch(Creators.getAdminInfoSuccess(response?.data || {}));
    } catch (error) {
      dispatch(Creators.getAdminInfoFailure(error.message || error.reason));
    }
  },
});

export const AdminTypes = Types;
export default Creators;
