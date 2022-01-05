import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { SignupFormTypes } from '../actions/signupForm';
import { defaultRegion } from '../../helpers/constants';

const INITIAL_STATE = {
  firstName: {},
  lastName: {},
  phone: {},
  password: {},
  repeatedPassword: {},
  primaryRegion: defaultRegion,
};

const resetForm = (state = INITIAL_STATE) => update(state, {
  firstName: { $set: INITIAL_STATE.firstName },
  lastName: { $set: INITIAL_STATE.lastName },
  phone: { $set: INITIAL_STATE.phone },
  primaryRegion: { $set: INITIAL_STATE.primaryRegion },
});

const resetPassword = (state = INITIAL_STATE) => update(state, {
  password: { $set: INITIAL_STATE.password },
  repeatedPassword: { $set: INITIAL_STATE.repeatedPassword },
});

const updateField = (state = INITIAL_STATE, { field }) => update(state, {
  [field.name]: {
    value: { $set: field.value.trim() },
    error: { $set: field.error },
  },
});

const updateRegion = (state = INITIAL_STATE, { region }) => update(state, {
  primaryRegion: { $set: region },
});

export default createReducer(INITIAL_STATE, {
  [SignupFormTypes.RESET_FORM]: resetForm,
  [SignupFormTypes.RESET_PASSWORD]: resetPassword,
  [SignupFormTypes.UPDATE_FIELD]: updateField,
  [SignupFormTypes.UPDATE_REGION]: updateRegion,
});
