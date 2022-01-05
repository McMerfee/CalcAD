import { createReducer } from 'reduxsauce';
import update from 'immutability-helper';

import { tfaFormTypes } from '../actions/tfaForm';

const INITIAL_STATE = {
  confirmationCode: { value: '' },
  isLoading: false,
  isConfirmationCodeSent: false,
  isConfirmationCodeValid: false,
  isPhoneNumberVerified: false,
};

const resetTFAForm = (state = INITIAL_STATE) => update(state, {
  confirmationCode: { $set: INITIAL_STATE.confirmationCode },
  isConfirmationCodeSent: { $set: INITIAL_STATE.isConfirmationCodeSent },
  isConfirmationCodeValid: { $set: INITIAL_STATE.isConfirmationCodeValid },
  isPhoneNumberVerified: { $set: INITIAL_STATE.isPhoneNumberVerified },
});

const updateConfirmationCode = (state = INITIAL_STATE, { field }) => update(state, {
  confirmationCode: {
    value: { $set: field.value },
    error: { $set: field.error },
  },
});

const sendConfirmationCodeRequest = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: true },
  isConfirmationCodeSent: { $set: false },
});

const sendConfirmationCodeSuccess = (state = INITIAL_STATE, { secret }) => update(state, {
  isConfirmationCodeSent: { $set: true },
  isLoading: { $set: false },
  secret: { $set: secret },
});

const sendConfirmationCodeFailure = (state = INITIAL_STATE) => update(state, {
  isLoading: { $set: false },
  isConfirmationCodeSent: { $set: false },
});

export default createReducer(INITIAL_STATE, {
  [tfaFormTypes.RESET_TFA_FORM]: resetTFAForm,
  [tfaFormTypes.UPDATE_CONFIRMATION_CODE]: updateConfirmationCode,
  [tfaFormTypes.SEND_CONFIRMATION_CODE_REQUEST]: sendConfirmationCodeRequest,
  [tfaFormTypes.SEND_CONFIRMATION_CODE_SUCCESS]: sendConfirmationCodeSuccess,
  [tfaFormTypes.SEND_CONFIRMATION_CODE_FAILURE]: sendConfirmationCodeFailure,
});
