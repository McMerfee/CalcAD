import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  resetTFAForm: null,
  updateConfirmationCode: ['field'],

  sendConfirmationCodeRequest: null,
  sendConfirmationCodeSuccess: ['secret'],
  sendConfirmationCodeFailure: null,

  setIsConfirmationCodeSent: ['isSent'],
});

export const tfaFormTypes = Types;
export default Creators;
