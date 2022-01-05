import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { ProfileTypes } from '../actions/profile';
import { defaultLanguage } from '../../helpers/constants';

const INITIAL_STATE = {
  firstName: { value: '' },
  lastName: { value: '' },
  phone: { value: '' },
  currentFirstName: { value: '' },
  currentLastName: { value: '' },
  currentPhone: { value: '' },
  language: defaultLanguage,
  delivery: {
    code1C: '',
    type: '',
    postOffice: '',
    addressLine: '',
    city: '',
    region: '',
  },
  isLoading: false,
  isUpdating: false,
  primaryRegion: '',
  regionsList: [],
  errorMessage: '',
};

const updateProfileField = (state = INITIAL_STATE, { field }) => update(state, {
  [field.name]: {
    value: { $set: field.value },
    error: { $set: field.error },
  },
});

const setProfileLanguageRequest = (state = INITIAL_STATE) => update(state, {
  errorMessage: { $set: '' },
});

const getUserProfileRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  errorMessage: { $set: '' },
});

const getUserProfileSuccess = (state = INITIAL_STATE, { profile }) => update(state, {
  isLoading: { $set: false },
  firstName: { value: { $set: profile?.firstName || '' } },
  lastName: { value: { $set: profile?.lastName || '' } },
  phone: { value: { $set: profile?.phone || '' } },
  currentFirstName: { value: { $set: profile?.firstName || '' } },
  currentLastName: { value: { $set: profile?.lastName || '' } },
  currentPhone: { value: { $set: profile?.phone || '' } },
  language: { $set: profile?.language || defaultLanguage },
  primaryRegion: { $set: profile?.primaryRegion || '' },
  regionsList: { $set: profile?.regionsList || [] },
  delivery: { $set: profile?.delivery || {} },
  packageName: { $set: profile?.packageName || {} },
});

const getUserProfileFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isLoading: { $set: false },
  errorMessage: { $set: errorMessage },
});


const submitProfileFormRequest = (state = INITIAL_STATE) => update(state, {
  isUpdating: { $set: true },
  errorMessage: { $set: '' },
});

const submitProfileFormSuccess = (state = INITIAL_STATE) => update(state, {
  isUpdating: { $set: false },
  errorMessage: { $set: '' },
});

const submitProfileFormFailure = (state = INITIAL_STATE, { errorMessage }) => update(state, {
  isUpdating: { $set: false },
  errorMessage: { $set: errorMessage },
});


export default createReducer(INITIAL_STATE, {
  [ProfileTypes.UPDATE_PROFILE_FIELD]: updateProfileField,
  [ProfileTypes.SET_PROFILE_LANGUAGE_REQUEST]: setProfileLanguageRequest,
  [ProfileTypes.GET_USER_PROFILE_REQUEST]: getUserProfileRequest,
  [ProfileTypes.GET_USER_PROFILE_SUCCESS]: getUserProfileSuccess,
  [ProfileTypes.GET_USER_PROFILE_FAILURE]: getUserProfileFailure,
  [ProfileTypes.SUBMIT_PROFILE_FORM_REQUEST]: submitProfileFormRequest,
  [ProfileTypes.SUBMIT_PROFILE_FORM_SUCCESS]: submitProfileFormSuccess,
  [ProfileTypes.SUBMIT_PROFILE_FORM_FAILURE]: submitProfileFormFailure,
});
