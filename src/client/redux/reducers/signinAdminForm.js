import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { SigninAdminFormTypes } from '../actions/signinAdminForm';

const INITIAL_STATE = {
  email: {},
  password: {},
};

const resetSigninAdminForm = (state = INITIAL_STATE) => update(state, {
  password: { $set: INITIAL_STATE.password },
  email: { $set: INITIAL_STATE.email },
});

const updateSigninAdminField = (state = INITIAL_STATE, { field }) => update(state, {
  [field.name]: {
    value: { $set: field.value },
    error: { $set: field.error },
  },
});

export default createReducer(INITIAL_STATE, {
  [SigninAdminFormTypes.RESET_SIGNIN_ADMIN_FORM]: resetSigninAdminForm,
  [SigninAdminFormTypes.UPDATE_SIGNIN_ADMIN_FIELD]: updateSigninAdminField,
});
