import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { ConfigTypes } from '../actions/config';

const INITIAL_STATE = {
  isLoading: false,
  errorMessage: null,
  aluminiumColors: [],
  systemConctants: [],
  connectingProfiles: [],
  doorLatchMechanisms: [],
  sideProfiles: [],
  mechanisms: [],
  filling: [],
  fillingFeatures: [],
  brushes: [],
  isConfigFetched: false,
};

/** Connecting Profiles */

const getConnectingProfilesRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
});

const getConnectingProfilesSuccess = (state = INITIAL_STATE, { connectingProfiles }) => update(state, {
  isLoading: { $set: false },
  connectingProfiles: { $set: connectingProfiles || [] },
});

const getConnectingProfilesFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** Side Profiles */

const getSideProfilesRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
});

const getSideProfilesSuccess = (state = INITIAL_STATE, { sideProfiles }) => update(state, {
  isLoading: { $set: false },
  sideProfiles: { $set: sideProfiles || [] },
});

const getSideProfilesFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});

/** All Config Data */

const getConfigRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  isConfigFetched: { $set: false },
});

const getConfigSuccess = (state = INITIAL_STATE, { data }) => update(state, {
  isLoading: { $set: false },
  aluminiumColors: { $set: data?.aluminiumColors || [] },
  systemConctants: { $set: data?.systemConctants || [] },
  connectingProfiles: { $set: data?.connectingProfiles || [] },
  doorLatchMechanisms: { $set: data?.doorLatchMechanisms || [] },
  sideProfiles: { $set: data?.sideProfiles || [] },
  mechanisms: { $set: data?.mechanisms || [] },
  filling: { $set: data?.filling || [] },
  fillingFeatures: { $set: data?.fillingFeatures || [] },
  brushes: { $set: data?.brushes || [] },
  isConfigFetched: { $set: true },
});

const getConfigFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
  isConfigFetched: { $set: false },
});

/**
 * Reducers
 */

export default createReducer(INITIAL_STATE, {

  /** Connecting Profiles */

  [ConfigTypes.GET_CONNECTING_PROFILES_REQUEST]: getConnectingProfilesRequest,
  [ConfigTypes.GET_CONNECTING_PROFILES_SUCCESS]: getConnectingProfilesSuccess,
  [ConfigTypes.GET_CONNECTING_PROFILES_FAILURE]: getConnectingProfilesFailure,

  /** Side Profiles */

  [ConfigTypes.GET_SIDE_PROFILES_REQUEST]: getSideProfilesRequest,
  [ConfigTypes.GET_SIDE_PROFILES_SUCCESS]: getSideProfilesSuccess,
  [ConfigTypes.GET_SIDE_PROFILES_FAILURE]: getSideProfilesFailure,

  /** All Config Data */

  [ConfigTypes.GET_CONFIG_REQUEST]: getConfigRequest,
  [ConfigTypes.GET_CONFIG_SUCCESS]: getConfigSuccess,
  [ConfigTypes.GET_CONFIG_FAILURE]: getConfigFailure,
});
