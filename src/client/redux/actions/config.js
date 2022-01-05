import { createActions } from 'reduxsauce';

import API from '../../api';

import OrderActions from './order';

const { Types, Creators } = createActions({
  getConnectingProfilesRequest: null,
  getConnectingProfilesSuccess: ['connectingProfiles'],
  getConnectingProfilesFailure: ['errorMessage'],

  getSideProfilesRequest: null,
  getSideProfilesSuccess: ['sideProfiles'],
  getSideProfilesFailure: ['errorMessage'],

  getConfigSuccess: ['data'],
  getConfigFailure: ['errorMessage'],
  getConfigRequest: (systemType) => async (dispatch, state) => {
    try {
      const currentState = state();
      const currentSystem = systemType || currentState?.systems?.currentSystem;

      const response = await API.config.get(currentSystem);
      const { ok, problem, data } = response || {};
      const error = data?.error || {};

      const config = response?.data?.config || [];
      const errorMessage = !ok
        ? (error?.message || data?.message || problem)
        : '';

      if (errorMessage) {
        dispatch(Creators.getConfigFailure(errorMessage));
        return;
      }

      dispatch(Creators.getConfigSuccess(config));

      // Update total price and specification
      dispatch(OrderActions.calculateOrderRequest());
    } catch (error) {
      dispatch(Creators.getConfigFailure(error.message || error.reason));
    }
  },
});

export const ConfigTypes = Types;
export default Creators;
