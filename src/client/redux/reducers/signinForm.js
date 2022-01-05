import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { SigninFormTypes } from '../actions/signinForm';

const INITIAL_STATE = {
  phone: {},
  password: {},
};

const resetSigninForm = (state = INITIAL_STATE) => update(state, {
  password: { $set: INITIAL_STATE.password },
  phone: { $set: INITIAL_STATE.phone },
});

const updateSigninField = (state = INITIAL_STATE, { field }) => update(state, {
  [field.name]: {
    value: { $set: field.value },
    error: { $set: field.error },
  },
});

export default createReducer(INITIAL_STATE, {
  [SigninFormTypes.RESET_SIGNIN_FORM]: resetSigninForm,
  [SigninFormTypes.UPDATE_SIGNIN_FIELD]: updateSigninField,
});
