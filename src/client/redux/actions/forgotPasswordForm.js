import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  resetForgotPasswordForm: null,
  updateForgotPasswordField: ['field'],
});

export const ForgotPasswordFormTypes = Types;
export default Creators;
