import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { ForgotPasswordFormTypes } from '../actions/forgotPasswordForm';

const INITIAL_STATE = {
  phone: {},
  confirmationCode: {},
  password: {},
  repeatedPassword: {},
};

const resetForgotPasswordForm = (state = INITIAL_STATE) => update(state, {
  phone: { $set: INITIAL_STATE.phone },
  confirmationCode: { $set: INITIAL_STATE.confirmationCode },
  password: { $set: INITIAL_STATE.password },
  repeatedPassword: { $set: INITIAL_STATE.repeatedPassword },
});

const updateForgotPasswordField = (state = INITIAL_STATE, { field }) => update(state, {
  [field.name]: {
    value: { $set: field.value },
    error: { $set: field.error },
  },
});

export default createReducer(INITIAL_STATE, {
  [ForgotPasswordFormTypes.RESET_FORGOT_PASSWORD_FORM]: resetForgotPasswordForm,
  [ForgotPasswordFormTypes.UPDATE_FORGOT_PASSWORD_FIELD]: updateForgotPasswordField,
});
